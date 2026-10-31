#!/usr/bin/env bash
# Deploys a commit of `main` on the VPS (/opt/pikorua-website). Normally run by
# GitHub Actions through deploy/ci-deploy.sh, which builds the image in Actions
# and pushes it to GHCR; this script pulls it. Touches only the
# `pikorua-website` Compose project — never other containers, images or volumes.
#
#   ./deploy/deploy.sh <sha> --token-stdin   # pull ghcr image <sha> (token on stdin)
#   ./deploy/deploy.sh [<sha>] --build-local # fallback: build on the VPS as before
#   add --migrations-applied when the deploy adds SQL migrations you applied
#
# Steps: lock → fetch → refuse if the tree is dirty, the commit is not on main
# (or is older than the running one, for CI) or new SQL migrations are
# unapplied → tag the running image as :rollback → dump the DB → pull or build →
# swap → smoke test → on failure, put the previous image and commit back.
set -euo pipefail

# Everything is inside main so bash parses the whole script before the
# checkout below replaces this file on disk.
main() {
  cd "$(dirname "$0")/.."

  BRANCH=main
  REGISTRY_IMAGE=ghcr.io/pikoruarealty/pikoruawebsite
  BACKUP_DIR=${BACKUP_DIR:-/root/backups}
  KEEP_DUMPS=10
  KEEP_IMAGES=3

  TARGET=""
  MIGRATIONS_APPLIED=false
  BUILD_LOCAL=false
  TOKEN=""
  for arg in "$@"; do
    case "$arg" in
      --migrations-applied) MIGRATIONS_APPLIED=true ;;
      --build-local) BUILD_LOCAL=true ;;
      --token-stdin) IFS= read -r TOKEN || true ;;
      -*) echo "Unknown option: $arg" >&2; exit 2 ;;
      *) TARGET="$arg" ;;
    esac
  done
  if [ "$BUILD_LOCAL" != true ] && [ -z "$TARGET" ]; then
    echo "Give the commit to deploy (its image must be in GHCR), or use --build-local." >&2
    exit 2
  fi

  if [ ! -f .env.production ]; then
    echo "Missing .env.production (see .env.local.example and docs/VPS_MIGRATION_PLAN.md)." >&2
    exit 1
  fi

  # One deploy at a time (a duplicated build once ran after an SSH drop).
  exec 9>/tmp/pikorua-website-deploy.lock
  flock -n 9 || { echo "Another deploy is running." >&2; exit 1; }

  DOCKER=(docker)
  docker info >/dev/null 2>&1 || DOCKER=(sudo -n docker)
  compose() { "${DOCKER[@]}" compose --env-file .env.production "$@"; }

  if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
    echo "Working tree has local changes; commit or stash them first:" >&2
    git status --short --untracked-files=no >&2
    exit 1
  fi

  git fetch --quiet origin "$BRANCH"
  TARGET=$(git rev-parse --verify "${TARGET:-origin/$BRANCH}^{commit}")
  if ! git merge-base --is-ancestor "$TARGET" "origin/$BRANCH"; then
    echo "$TARGET is not on origin/$BRANCH; refusing to deploy it." >&2
    exit 1
  fi
  PREVIOUS=$(git rev-parse HEAD)
  # A late-approved CI run must not silently roll the site back. Deliberate
  # rollbacks are done by hand (runbook B10) or by reverting on main.
  if [ -n "$TOKEN" ] && [ "$TARGET" != "$PREVIOUS" ] && git merge-base --is-ancestor "$TARGET" "$PREVIOUS"; then
    echo "$TARGET is older than the running commit $PREVIOUS; refusing." >&2
    exit 1
  fi

  # SQL migrations are applied by hand (docs/production-runbook.md I6) before
  # the code that needs them goes live.
  NEW_MIGRATIONS=$(git diff --name-only --diff-filter=A "$PREVIOUS" "$TARGET" -- supabase/migrations/)
  if [ -n "$NEW_MIGRATIONS" ] && [ "$MIGRATIONS_APPLIED" != true ]; then
    echo "This deploy adds SQL migrations:" >&2
    echo "$NEW_MIGRATIONS" >&2
    echo "Apply them to the live DB first, then re-run with --migrations-applied." >&2
    exit 1
  fi

  echo "Deploying $(git rev-parse --short "$TARGET") (was $(git rev-parse --short "$PREVIOUS"))"
  git checkout --quiet -B "$BRANCH" "$TARGET"
  git branch --quiet --set-upstream-to="origin/$BRANCH" "$BRANCH"

  # Shared network with the in-house CRM container (see docker-compose.yml).
  "${DOCKER[@]}" network inspect pikorua-integrations >/dev/null 2>&1 || "${DOCKER[@]}" network create pikorua-integrations

  # A local build reads the DB (BUILD_DATABASE_URL), so the db must be up first.
  compose up -d --wait db

  HAS_ROLLBACK=false
  if RUNNING_IMAGE=$("${DOCKER[@]}" inspect -f '{{.Image}}' pikorua-website-app 2>/dev/null); then
    "${DOCKER[@]}" tag "$RUNNING_IMAGE" pikorua-website:rollback
    HAS_ROLLBACK=true
  fi

  # Safety dump before every deploy (contains personal data: owner-only).
  mkdir -p "$BACKUP_DIR"
  DUMP="$BACKUP_DIR/pikorua-predeploy-$(date +%F-%H%M)-$(git rev-parse --short "$TARGET").dump"
  (umask 077 && "${DOCKER[@]}" exec pikorua-website-db pg_dump -U pikorua_app -Fc pikorua > "$DUMP")
  ls -1t "$BACKUP_DIR"/pikorua-predeploy-*.dump | tail -n +$((KEEP_DUMPS + 1)) | xargs -r rm -f
  echo "DB dump: $DUMP"

  rollback() {
    echo "Deploy failed; rolling back to $(git rev-parse --short "$PREVIOUS")." >&2
    git checkout --quiet -B "$BRANCH" "$PREVIOUS"
    if [ "$HAS_ROLLBACK" = true ]; then
      "${DOCKER[@]}" tag pikorua-website:rollback pikorua-website:latest
      compose up -d --no-build --wait app || true
    fi
    exit 1
  }

  # The old container keeps serving during the pull/build; only the swap is a few seconds.
  if [ "$BUILD_LOCAL" = true ]; then
    compose build app || rollback
  else
    # Throwaway docker config, so the short-lived Actions token never lands in
    # root's ~/.docker (which other apps on this server may use).
    CFG=$(mktemp -d)
    if [ -n "$TOKEN" ]; then
      printf '%s' "$TOKEN" | "${DOCKER[@]}" --config "$CFG" login ghcr.io -u github-actions --password-stdin >/dev/null || { rm -rf "$CFG"; rollback; }
    fi
    "${DOCKER[@]}" --config "$CFG" pull --quiet "$REGISTRY_IMAGE:$TARGET" || { rm -rf "$CFG"; rollback; }
    rm -rf "$CFG"
    "${DOCKER[@]}" tag "$REGISTRY_IMAGE:$TARGET" pikorua-website:latest
  fi
  compose up -d --no-build --wait app || rollback
  ./deploy/smoke-test.sh http://127.0.0.1:3100 || rollback

  # Old images of this project only: untagged local builds, and pulled GHCR
  # images beyond the newest few (images still in use are skipped by rmi).
  "${DOCKER[@]}" image prune -f --filter label=com.docker.compose.project=pikorua-website >/dev/null || true
  "${DOCKER[@]}" images "$REGISTRY_IMAGE" --format '{{.Repository}}:{{.Tag}}' | tail -n +$((KEEP_IMAGES + 1)) \
    | xargs -r "${DOCKER[@]}" rmi >/dev/null 2>&1 || true

  echo "Deployed $(git rev-parse --short HEAD)"
  compose ps
}

main "$@"
exit
