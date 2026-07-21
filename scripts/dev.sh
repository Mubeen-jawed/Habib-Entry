#!/usr/bin/env bash
# Imtehan, one-shot dev bootstrap.
# Installs deps, applies migrations, seeds the DB, then starts the dev server.

set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Installing dependencies"
pnpm install

echo "==> Generating Prisma client"
pnpm prisma generate

echo "==> Applying database migrations"
pnpm prisma migrate deploy

echo "==> Seeding database (idempotent)"
pnpm db:seed

PORT="${PORT:-3005}"

# If the desired port is busy, free it so AUTH_URL stays consistent.
if command -v lsof >/dev/null 2>&1; then
  if lsof -ti:"$PORT" >/dev/null 2>&1; then
    echo "==> Port $PORT is in use, freeing it"
    lsof -ti:"$PORT" | xargs -r kill -9 || true
    sleep 1
  fi
fi

echo "==> Starting Next.js dev server on http://localhost:$PORT"
exec pnpm next dev --port "$PORT"
