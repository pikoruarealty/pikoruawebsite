#!/usr/bin/env bash
# Prints only the build-time, non-secret lines of .env.production (the
# NEXT_PUBLIC_* values Next inlines into the browser bundle, plus the SEO combo
# flag). GitHub Actions reads this to build the image with the same values as
# the server, so .env.production stays the single source of truth. Runs as
# root via sudo for the website-deploy user (see deploy/ci-deploy.sh).
set -euo pipefail

grep -E '^(NEXT_PUBLIC_[A-Z0-9_]*|SEO_COMBO_STRICT_MATCHING)=' "$(dirname "$0")/../.env.production" || true
