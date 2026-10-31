#!/usr/bin/env bash
# Post-deploy checks (production runbook B9). Creates no data.
#   ./deploy/smoke-test.sh http://127.0.0.1:3100   # on the VPS, straight to the app
#   ./deploy/smoke-test.sh https://www.pikorua.in  # public, through Cloudflare + Nginx
set -uo pipefail

BASE=${1:?usage: smoke-test.sh <base-url>}
BASE=${BASE%/}
FAILED=0

# Retries a few times: the app can need a moment after the container swap.
expect() {
  local want=$1 method=$2 path=$3 got=""
  for _ in 1 2 3 4 5; do
    if [ "$method" = POST ]; then
      got=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 -X POST -H 'Content-Type: application/json' -d '{}' "$BASE$path")
    else
      got=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$BASE$path")
    fi
    [ "$got" = "$want" ] && break
    sleep 3
  done
  if [ "$got" = "$want" ]; then
    echo "ok   $got $method $path"
  else
    echo "FAIL $got $method $path (expected $want)" >&2
    FAILED=1
  fi
}

for page in / /properties /about /testimonials /contact /blog /nri /sitemap.xml /robots.txt; do
  expect 200 GET "$page"
done

# Validation runs and nothing is saved.
expect 422 POST /api/leads

if [[ "$BASE" == *127.0.0.1* || "$BASE" == *localhost* ]]; then
  # Straight to the app: the CRM feed exists but needs the key.
  expect 401 GET /api/crm/leads
else
  # Public: Nginx hides the CRM feed and serves media from disk.
  expect 404 GET /api/crm/leads
  expect 200 GET /media/videos/bg.mp4
fi

exit $FAILED
