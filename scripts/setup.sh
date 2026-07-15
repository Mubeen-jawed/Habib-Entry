#!/usr/bin/env bash
# Habib Entry — first-time setup on a fresh developer machine.
#
# Installs Node.js and pnpm (if missing), creates a local .env from the
# example, applies Prisma migrations, seeds the SQLite DB, and prints how
# to start the dev server.
#
# Supports Ubuntu/Debian and macOS. Re-runnable: safe to run again.

set -euo pipefail

cd "$(dirname "$0")/.."
APP_DIR="$(pwd)"
NODE_MAJOR="${NODE_MAJOR:-20}"
APP_PORT="${APP_PORT:-3005}"

# ---------- helpers ---------------------------------------------------------
log()  { printf '\n\033[1;34m==>\033[0m %s\n' "$*"; }
warn() { printf '\n\033[1;33m!!\033[0m  %s\n' "$*" >&2; }
die()  { printf '\n\033[1;31mxx\033[0m %s\n' "$*" >&2; exit 1; }

detect_os() {
  case "$(uname -s)" in
    Linux)  if [ -f /etc/debian_version ]; then echo "debian"; else echo "linux-other"; fi ;;
    Darwin) echo "macos" ;;
    *)      echo "unknown" ;;
  esac
}

# ---------- 1. Node.js ------------------------------------------------------
install_node_debian() {
  log "Installing Node.js $NODE_MAJOR via NodeSource (apt)"
  sudo -v
  sudo apt-get update -y
  sudo apt-get install -y --no-install-recommends ca-certificates curl gnupg
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | sudo -E bash -
  sudo apt-get install -y --no-install-recommends nodejs
}

install_node_macos() {
  if ! command -v brew >/dev/null 2>&1; then
    die "Homebrew not found. Install it from https://brew.sh then re-run this script."
  fi
  log "Installing Node.js $NODE_MAJOR via Homebrew"
  brew install "node@${NODE_MAJOR}"
  brew link --overwrite --force "node@${NODE_MAJOR}" || true
}

need_node=1
if command -v node >/dev/null 2>&1; then
  CURRENT_MAJOR="$(node -v | sed 's/v//' | cut -d. -f1)"
  if [ "$CURRENT_MAJOR" -ge "$NODE_MAJOR" ]; then need_node=0; fi
fi

if [ "$need_node" -eq 1 ]; then
  case "$(detect_os)" in
    debian) install_node_debian ;;
    macos)  install_node_macos ;;
    *)      die "Unsupported OS. Install Node.js ${NODE_MAJOR}+ manually, then re-run." ;;
  esac
fi
log "Node: $(node -v), npm: $(npm -v)"

# ---------- 2. pnpm ---------------------------------------------------------
if ! command -v pnpm >/dev/null 2>&1; then
  if command -v corepack >/dev/null 2>&1; then
    log "Enabling pnpm via corepack"
    sudo corepack enable 2>/dev/null || corepack enable
    corepack prepare pnpm@latest --activate
  else
    log "Installing pnpm globally via npm"
    if [ "$(detect_os)" = "debian" ]; then
      sudo npm install -g pnpm
    else
      npm install -g pnpm
    fi
  fi
fi
log "pnpm: $(pnpm -v)"

# ---------- 3. .env ---------------------------------------------------------
ENV_FILE="$APP_DIR/.env"
ENV_EXAMPLE="$APP_DIR/.env.example"

if [ ! -f "$ENV_FILE" ]; then
  if [ ! -f "$ENV_EXAMPLE" ]; then
    die ".env.example is missing — can't bootstrap .env"
  fi
  log "Creating .env from .env.example"
  cp "$ENV_EXAMPLE" "$ENV_FILE"

  # Generate a real AUTH_SECRET, replacing the placeholder from the example.
  SECRET="$(openssl rand -base64 32 2>/dev/null || node -e 'console.log(require("crypto").randomBytes(32).toString("base64"))')"
  # sed with a delimiter that won't collide with base64 chars (=, +, /)
  sed -i.bak "s|^AUTH_SECRET=.*|AUTH_SECRET=\"${SECRET}\"|" "$ENV_FILE" && rm -f "$ENV_FILE.bak"

  # Match AUTH_URL to the port the app actually runs on.
  sed -i.bak "s|^AUTH_URL=.*|AUTH_URL=\"http://localhost:${APP_PORT}\"|" "$ENV_FILE" && rm -f "$ENV_FILE.bak"

  chmod 600 "$ENV_FILE"
else
  log ".env already present — leaving it alone"
fi

# ---------- 4. install + prisma + seed --------------------------------------
log "Installing dependencies"
pnpm install

log "Generating Prisma client"
pnpm prisma generate

log "Applying Prisma migrations"
pnpm prisma migrate deploy

log "Seeding database (idempotent)"
pnpm db:seed || warn "seed step reported an error — continuing"

# ---------- done ------------------------------------------------------------
log "Setup complete"
cat <<EOF

  Start the dev server:
    pnpm dev                    # http://localhost:${APP_PORT}

  Other useful commands:
    pnpm db:studio              # browse the local SQLite DB
    pnpm db:seed:sat            # (re)seed SAT question bank
    pnpm build && pnpm start    # production build locally

EOF
