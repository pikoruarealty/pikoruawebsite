#!/usr/bin/env bash
# One-time VPS setup for GitHub Actions build + deploy. Run as root:
#   bash /opt/pikorua-website/deploy/setup-deploy-user.sh 'ssh-ed25519 AAAA... github-actions-deploy'
#
# Creates:
#   - the unprivileged `website-deploy` user (no password, no groups) whose SSH
#     key can only run deploy/ci-deploy.sh or tunnel to 127.0.0.1:5433;
#   - /etc/sudoers.d/website-deploy allowing exactly deploy.sh and public-env.sh;
#   - the read-only `pikorua_build` DB role (SELECT on the public content
#     tables only, never leads) used by the image build in Actions.
# Safe on the shared server: it only creates new files/roles, never edits sshd,
# Nginx, Docker, ufw or other users, and changes ownership only inside
# /opt/pikorua-website. Re-running it is fine; it rotates the pikorua_build
# password, so update the BUILD_DATABASE_URL secret afterwards.
set -euo pipefail

APP_DIR=/opt/pikorua-website
USER_NAME=website-deploy
SUDOERS=/etc/sudoers.d/website-deploy
DB_CONTAINER=pikorua-website-db
# Every table the public pages read at build time (src/lib/db/queries.ts).
BUILD_TABLES="blogs, general_faqs, pages, properties, testimonials"
PUBKEY=${1:-}

die() { echo "ERROR: $*" >&2; exit 1; }

[ "$(id -u)" = 0 ] || die "run as root"
for f in deploy.sh ci-deploy.sh public-env.sh; do
  [ -x "$APP_DIR/deploy/$f" ] || die "$APP_DIR is not on a commit with the CI/CD scripts (git checkout main first)"
done
KEY_RE='^ssh-ed25519 [A-Za-z0-9+/=]+( [^"]*)?$'
[[ "$PUBKEY" =~ $KEY_RE ]] \
  || die "pass the public key line (ssh-ed25519 AAAA... comment) as the only argument"
docker inspect -f '{{.State.Health.Status}}' "$DB_CONTAINER" 2>/dev/null | grep -qx healthy \
  || die "$DB_CONTAINER is not running and healthy"

# sshd settings that would silently block the deploy user or its DB tunnel;
# editing sshd is not this script's job on a shared server.
SSHD=$(sshd -T 2>/dev/null) || die "could not read the sshd configuration (sshd -T)"
if grep -qiE '^(allowusers|allowgroups) ' <<< "$SSHD"; then
  grep -iE '^(allowusers|allowgroups) ' <<< "$SSHD" >&2
  die "sshd restricts logins with AllowUsers/AllowGroups; add $USER_NAME there by hand first"
fi
grep -qiE '^allowtcpforwarding (yes|all|local)$' <<< "$SSHD" && ! grep -qiE '^disableforwarding yes$' <<< "$SSHD" \
  || die "sshd disables TCP forwarding; the Actions build needs a tunnel to 127.0.0.1:5433"

# The sudoers rules are only safe while nobody but root can change these scripts.
echo "Checking ownership in $APP_DIR ..."
BAD=$(find "$APP_DIR" \( ! -user root -o -perm /022 \) -not -type l -print | head -n 20 || true)
if [ -n "$BAD" ]; then
  echo "Making these root-owned and not group/world-writable:"
  echo "$BAD"
  find "$APP_DIR" ! -user root -not -type l -exec chown root:root {} +
  find "$APP_DIR" -perm /022 -not -type l -exec chmod go-w {} +
fi
[ "$(stat -c '%U %a' "$APP_DIR/.env.production")" = "root 600" ] \
  || die ".env.production must be owned by root with mode 600"
# Parent directories too: whoever can rename $APP_DIR could swap the scripts.
for d in /opt /; do
  [ "$(stat -c %U "$d")" = root ] || die "$d is not owned by root"
  [ "$(( 0$(stat -c %a "$d") & 022 ))" = 0 ] || die "$d is group/world-writable"
done

if id "$USER_NAME" >/dev/null 2>&1; then
  echo "User $USER_NAME already exists."
else
  # useradd leaves the password locked; no supplementary groups.
  useradd --create-home --shell /bin/bash "$USER_NAME"
  echo "Created user $USER_NAME."
fi
if id -nG "$USER_NAME" | tr ' ' '\n' | grep -qxE 'docker|sudo|adm|wheel|root'; then
  die "$USER_NAME is in a privileged group: $(id -nG "$USER_NAME")"
fi

# Validate before installing: a broken sudoers file would break sudo for everyone.
TMP=$(mktemp)
cat > "$TMP" <<EOF
$USER_NAME ALL=(root) NOPASSWD: $APP_DIR/deploy/deploy.sh, $APP_DIR/deploy/public-env.sh
EOF
visudo -cf "$TMP" >/dev/null || { rm -f "$TMP"; die "sudoers rule failed validation"; }
install -m 440 -o root -g root "$TMP" "$SUDOERS"
rm -f "$TMP"
visudo -c >/dev/null || die "sudo configuration invalid after install (remove $SUDOERS)"
echo "Installed $SUDOERS."

HOME_DIR=$(getent passwd "$USER_NAME" | cut -d: -f6)
install -d -m 700 -o "$USER_NAME" -g "$USER_NAME" "$HOME_DIR/.ssh"
printf 'command="%s/deploy/ci-deploy.sh",restrict,port-forwarding,permitopen="127.0.0.1:5433" %s\n' \
  "$APP_DIR" "$PUBKEY" > "$HOME_DIR/.ssh/authorized_keys"
chown "$USER_NAME:$USER_NAME" "$HOME_DIR/.ssh/authorized_keys"
chmod 600 "$HOME_DIR/.ssh/authorized_keys"
echo "Installed the deploy key (forced command, tunnel to 127.0.0.1:5433 only)."

# Read-only build role. The password goes in over stdin, never on a command line.
BUILD_PW=$(openssl rand -hex 24)
docker exec -i "$DB_CONTAINER" psql -q -v ON_ERROR_STOP=1 -U pikorua_app -d pikorua >/dev/null <<SQL
\set pw '$BUILD_PW'
SELECT 'CREATE ROLE pikorua_build' WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'pikorua_build') \gexec
ALTER ROLE pikorua_build WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION PASSWORD :'pw';
ALTER ROLE pikorua_build SET default_transaction_read_only = on;
ALTER ROLE pikorua_build SET statement_timeout = '60s';
GRANT CONNECT ON DATABASE pikorua TO pikorua_build;
GRANT USAGE ON SCHEMA public TO pikorua_build;
GRANT SELECT ON $BUILD_TABLES TO pikorua_build;
SQL
echo "pikorua_build role ready (SELECT on: $BUILD_TABLES)."

echo
echo "== Checks =="
id "$USER_NAME"
sudo -l -U "$USER_NAME" | sed -n '/may run/,$p'
echo
echo "== GitHub secret VPS_KNOWN_HOSTS =="
echo "${VPS_PUBLIC_IP:-187.126.115.164} $(cut -d' ' -f1-2 /etc/ssh/ssh_host_ed25519_key.pub)"
echo
echo "== GitHub secret BUILD_DATABASE_URL (secret: paste into GitHub, then clear this screen) =="
echo "postgres://pikorua_build:$BUILD_PW@127.0.0.1:5433/pikorua"
