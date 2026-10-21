#!/usr/bin/env bash
# Deploys the latest code on the VPS. Run from the repo directory as a user in
# the docker group. Touches only the `pikorua-website` Compose project —
# never other containers, images or volumes.
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env.production ]; then
  echo "Missing .env.production (see .env.local.example and docs/VPS_MIGRATION_PLAN.md)." >&2
  exit 1
fi

compose() { docker compose --env-file .env.production "$@"; }

git pull --ff-only

# The image build reads the DB (BUILD_DATABASE_URL), so the db must be up first.
compose up -d --wait db
compose build app
compose up -d --wait app

echo "Deployed $(git rev-parse --short HEAD)"
compose ps
