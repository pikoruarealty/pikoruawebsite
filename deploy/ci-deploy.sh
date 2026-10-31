#!/usr/bin/env bash
# SSH forced command for the GitHub Actions deploy key, which logs in as the
# unprivileged `website-deploy` user. In ~website-deploy/.ssh/authorized_keys:
#   command="/opt/pikorua-website/deploy/ci-deploy.sh",restrict,port-forwarding,permitopen="127.0.0.1:5433" ssh-ed25519 AAAA... github-actions-deploy
# The key can only run this script, or open a tunnel to the website DB port
# (used by the Actions image build, which logs in as the read-only
# pikorua_build role). GitHub sends one of:
#   public-env                                  build-time NEXT_PUBLIC_* values
#   deploy <40-char sha> [--migrations-applied] pull and deploy that image;
#                                               GHCR token on stdin
# The scripts run as root through two sudoers rules (/etc/sudoers.d/website-deploy).
# The user is not in the docker group and cannot write to /opt/pikorua-website,
# so a leaked key can only redeploy a commit that is already on main.
set -euo pipefail

APP_DIR=/opt/pikorua-website
read -r -a ARGS <<< "${SSH_ORIGINAL_COMMAND:-}"

case "${ARGS[0]:-}" in
  public-env)
    exec sudo -n "$APP_DIR/deploy/public-env.sh"
    ;;
  deploy)
    if ! [[ "${ARGS[1]:-}" =~ ^[0-9a-f]{40}$ ]]; then
      echo "usage: deploy <commit-sha> [--migrations-applied]" >&2
      exit 2
    fi
    FLAGS=()
    case "${ARGS[2]:-}" in
      "") ;;
      --migrations-applied) FLAGS+=(--migrations-applied) ;;
      *) echo "unknown option: ${ARGS[2]}" >&2; exit 2 ;;
    esac
    exec sudo -n "$APP_DIR/deploy/deploy.sh" "${ARGS[1]}" --token-stdin "${FLAGS[@]}"
    ;;
  *)
    echo "usage: public-env | deploy <commit-sha> [--migrations-applied]" >&2
    exit 2
    ;;
esac
