#!/usr/bin/env bash
# Habib Entry — VPS deploy bootstrap.
#
# Target: Ubuntu / Debian, PostgreSQL, pnpm, PM2, nginx on port 3005.
# Run this ON the VPS, from the project root (or with APP_DIR set):
#
#   sudo -v && ./scripts/deploy.sh
#
# Re-runnable: safe to run repeatedly. Existing state is preserved.

set -euo pipefail

# ---------- configuration (override via env) --------------------------------
APP_NAME="${APP_NAME:-habib-entry}"
APP_PORT="${APP_PORT:-3005}"
APP_DIR="${APP_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
NODE_MAJOR="${NODE_MAJOR:-20}"

DB_NAME="${DB_NAME:-habib_entry}"
DB_USER="${DB_USER:-habib_entry}"
DB_PASSWORD="${DB_PASSWORD:-}"          # blank -> auto-generate + persist to .env

NGINX_SERVER_NAME="${NGINX_SERVER_NAME:-_}"   # e.g. app.example.com; "_" = default server
AUTH_URL_OVERRIDE="${AUTH_URL:-}"       # e.g. https://app.example.com; blank -> http://SERVER_NAME:PORT

# ---------- helpers ---------------------------------------------------------
log()  { printf '\n\033[1;34m==>\033[0m %s\n' "$*"; }
warn() { printf '\n\033[1;33m!!\033[0m  %s\n' "$*" >&2; }

apt_install() { sudo apt-get install -y --no-install-recommends "$@"; }

env_set() {
  # env_set KEY "value-without-quotes" FILE
  local key="$1" val="$2" file="$3"
  local escaped
  escaped="$(printf '%s' "$val" | sed 's/[&/|]/\\&/g')"
  if grep -q "^${key}=" "$file" 2>/dev/null; then
    sed -i "s|^${key}=.*|${key}=\"${escaped}\"|" "$file"
  else
    printf '%s="%s"\n' "$key" "$val" >> "$file"
  fi
}

require_sudo() {
  if ! sudo -n true 2>/dev/null; then
    log "sudo access required — you'll be prompted"
    sudo -v
  fi
}

# ---------- 1. system packages ----------------------------------------------
log "Updating apt and installing base packages"
require_sudo
sudo apt-get update -y
apt_install ca-certificates curl gnupg lsb-release git build-essential \
            openssl postgresql postgresql-contrib nginx

# ---------- 2. Node.js ------------------------------------------------------
NEED_NODE=1
if command -v node >/dev/null 2>&1; then
  CURRENT_MAJOR="$(node -v | sed 's/v//' | cut -d. -f1)"
  if [ "$CURRENT_MAJOR" -ge "$NODE_MAJOR" ]; then NEED_NODE=0; fi
fi
if [ "$NEED_NODE" -eq 1 ]; then
  log "Installing Node.js $NODE_MAJOR via NodeSource"
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | sudo -E bash -
  apt_install nodejs
fi
log "Node: $(node -v), npm: $(npm -v)"

# ---------- 3. pnpm & PM2 ---------------------------------------------------
if ! command -v pnpm >/dev/null 2>&1; then
  log "Installing pnpm globally"
  sudo npm install -g pnpm
fi
if ! command -v pm2 >/dev/null 2>&1; then
  log "Installing PM2 globally"
  sudo npm install -g pm2
fi

# ---------- 4. PostgreSQL: role + database ----------------------------------
log "Ensuring PostgreSQL is running"
sudo systemctl enable --now postgresql

if [ -z "$DB_PASSWORD" ]; then
  # try to reuse the existing password from .env so re-runs stay stable
  if [ -f "$APP_DIR/.env" ] && grep -q '^DATABASE_URL=' "$APP_DIR/.env"; then
    EXISTING_URL="$(grep '^DATABASE_URL=' "$APP_DIR/.env" | head -n1 | sed 's/^DATABASE_URL=//; s/^"//; s/"$//')"
    # postgresql://user:pass@host:port/db?...
    EXISTING_PW="$(printf '%s' "$EXISTING_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')"
    if [ -n "$EXISTING_PW" ]; then DB_PASSWORD="$EXISTING_PW"; fi
  fi
fi
if [ -z "$DB_PASSWORD" ]; then
  DB_PASSWORD="$(openssl rand -hex 24)"
  log "Generated a new DB password (will be written to .env)"
fi

log "Ensuring PostgreSQL role '$DB_USER' and database '$DB_NAME'"
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
  sudo -u postgres psql -c "CREATE ROLE \"$DB_USER\" LOGIN PASSWORD '$DB_PASSWORD';"
else
  # keep the role's password in sync with what we're writing to .env
  sudo -u postgres psql -c "ALTER ROLE \"$DB_USER\" WITH LOGIN PASSWORD '$DB_PASSWORD';"
fi

if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
  sudo -u postgres createdb -O "$DB_USER" "$DB_NAME"
fi

DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}?schema=public"

# ---------- 5. Prisma provider ---------------------------------------------
SCHEMA="$APP_DIR/prisma/schema.prisma"
if grep -q 'provider = "sqlite"' "$SCHEMA"; then
  log "Switching Prisma provider from sqlite to postgresql"
  sed -i 's/provider = "sqlite"/provider = "postgresql"/' "$SCHEMA"
fi

# ---------- 6. .env ---------------------------------------------------------
ENV_FILE="$APP_DIR/.env"
touch "$ENV_FILE"
chmod 600 "$ENV_FILE"

env_set DATABASE_URL "$DATABASE_URL" "$ENV_FILE"

if [ -n "$AUTH_URL_OVERRIDE" ]; then
  RESOLVED_AUTH_URL="$AUTH_URL_OVERRIDE"
elif [ "$NGINX_SERVER_NAME" != "_" ]; then
  RESOLVED_AUTH_URL="http://${NGINX_SERVER_NAME}"
else
  RESOLVED_AUTH_URL="http://localhost:${APP_PORT}"
fi
env_set AUTH_URL "$RESOLVED_AUTH_URL" "$ENV_FILE"

if ! grep -q '^AUTH_SECRET=' "$ENV_FILE"; then
  env_set AUTH_SECRET "$(openssl rand -hex 32)" "$ENV_FILE"
fi

env_set PORT "$APP_PORT" "$ENV_FILE"
env_set NODE_ENV "production" "$ENV_FILE"

# ---------- 7. install, migrate, build --------------------------------------
cd "$APP_DIR"

log "Installing dependencies (pnpm --frozen-lockfile)"
pnpm install --frozen-lockfile

log "Pushing Prisma schema to PostgreSQL (db push, not migrate deploy)"
# The tracked migrations under prisma/migrations/ were generated for SQLite
# and are not portable to PostgreSQL. `db push` creates the schema directly.
pnpm prisma db push --skip-generate

log "Generating Prisma client"
pnpm prisma generate

log "Seeding database (idempotent)"
pnpm db:seed || warn "seed step reported an error — continuing"

log "Building Next.js"
pnpm build

# ---------- 8. PM2 process --------------------------------------------------
ECOSYSTEM="$APP_DIR/ecosystem.config.cjs"
log "Writing PM2 ecosystem file: $ECOSYSTEM"
cat > "$ECOSYSTEM" <<EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    cwd: '$APP_DIR',
    script: 'node_modules/next/dist/bin/next',
    args: 'start --port $APP_PORT',
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: '$APP_PORT',
    },
  }],
};
EOF

log "Starting/reloading app under PM2"
pm2 startOrReload "$ECOSYSTEM" --update-env
pm2 save

# Register PM2 with systemd so it comes back on reboot (idempotent).
if ! systemctl list-unit-files 2>/dev/null | grep -q "^pm2-${USER}\.service"; then
  log "Registering PM2 to start on boot"
  PM2_STARTUP_CMD="$(pm2 startup systemd -u "$USER" --hp "$HOME" | tail -n 1)"
  if printf '%s' "$PM2_STARTUP_CMD" | grep -q '^sudo '; then
    eval "$PM2_STARTUP_CMD"
  else
    warn "pm2 startup did not print a sudo command; skipping auto-registration"
  fi
fi

# ---------- 9. nginx --------------------------------------------------------
NGINX_SITE="/etc/nginx/sites-available/$APP_NAME"
log "Configuring nginx site for '$NGINX_SERVER_NAME' -> 127.0.0.1:$APP_PORT"
sudo tee "$NGINX_SITE" > /dev/null <<EOF
server {
    listen 80;
    server_name $NGINX_SERVER_NAME;

    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300s;
    }
}
EOF

sudo ln -sfn "$NGINX_SITE" "/etc/nginx/sites-enabled/$APP_NAME"
if [ "$NGINX_SERVER_NAME" = "_" ]; then
  # only default-server sites conflict on port 80; drop nginx's default if enabled
  sudo rm -f /etc/nginx/sites-enabled/default
fi

log "Validating and reloading nginx"
sudo nginx -t
sudo systemctl reload nginx

# ---------- done ------------------------------------------------------------
log "Deployment complete"
printf '  App:   %s (PM2)\n' "$APP_NAME"
printf '  Port:  %s\n' "$APP_PORT"
printf '  URL:   %s\n' "$RESOLVED_AUTH_URL"
printf '  DB:    postgresql://%s@localhost/%s\n' "$DB_USER" "$DB_NAME"
printf '  Env:   %s\n' "$ENV_FILE"
echo
pm2 status
