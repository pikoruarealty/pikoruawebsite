#!/usr/bin/env bash
# Deploys the latest code on the VPS. Run as the `pikorua` user from the app
# directory. Touches only the `pikorua` PM2 process — never other apps.
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env.production ]; then
  echo "Missing .env.production — the build needs DATABASE_URL (see docs/VPS_MIGRATION_PLAN.md)." >&2
  exit 1
fi

git pull --ff-only
npm ci
npm run build
pm2 reload pikorua --update-env
pm2 save

echo "Deployed $(git rev-parse --short HEAD)"
