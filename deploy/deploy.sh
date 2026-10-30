#!/usr/bin/env bash
# Deploys the latest code on the VPS (/opt/pikorua-website). Uses sudo for
# docker when the user isn't in the docker group. Touches only the
# `pikorua-website` Compose project — never other containers, images or volumes.
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env.production ]; then
  echo "Missing .env.production (see .env.local.example and docs/VPS_MIGRATION_PLAN.md)." >&2
  exit 1
fi

DOCKER=(docker)
docker info >/dev/null 2>&1 || DOCKER=(sudo docker)
compose() { "${DOCKER[@]}" compose --env-file .env.production "$@"; }

git pull --ff-only

# Shared network with the in-house CRM container (see docker-compose.yml).
"${DOCKER[@]}" network inspect pikorua-integrations >/dev/null 2>&1   || "${DOCKER[@]}" network create pikorua-integrations

# The image build reads the DB (BUILD_DATABASE_URL), so the db must be up first.
compose up -d --wait db
compose build app
compose up -d --wait app

echo "Deployed $(git rev-parse --short HEAD)"
compose ps
