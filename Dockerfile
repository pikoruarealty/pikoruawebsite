# syntax=docker/dockerfile:1.7
# PIKORUA website — standalone Next.js image. Built and run via
# docker-compose.yml (see docs/VPS_MIGRATION_PLAN.md).

FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# .env.production is mounted only for this step, so secrets never land in an
# image layer; Next reads it for NEXT_PUBLIC_* inlining. BUILD_DATABASE_URL
# points at the db container's host-loopback port (the build runs on the host
# network) so statically generated pages are built with real DB content.
RUN --mount=type=secret,id=env_production,target=/app/.env.production \
    DATABASE_URL="$(sed -n 's/^BUILD_DATABASE_URL=//p' /app/.env.production)" \
    npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs \
 && mkdir -p /app/media \
 && chown nextjs:nodejs /app/media

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
