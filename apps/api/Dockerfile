# API image (NestJS + Prisma). Mirrors the Render setup in render.yaml so the API
# can run on any container host (Northflank, Koyeb, Fly, a VPS...).
# Build from the repo root:  docker build -f apps/api/Dockerfile .
FROM node:24-slim

# Prisma's query engine needs OpenSSL; slim images don't ship it.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

# Only the API and database workspaces (skips the Next.js app's dependencies).
# Dev deps stay installed: the Prisma CLI and tsx are used at startup.
RUN npm ci --include=dev --workspace=api --workspace=@repo/database --include-workspace-root \
  && npx prisma generate --schema=packages/database/prisma/schema.prisma \
  && npm run build --workspace=api

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Sync the schema (refuses destructive changes instead of dropping data), seed the
# admin user if missing, then start the API.
CMD ["sh", "-c", "npx prisma db push --schema=packages/database/prisma/schema.prisma --skip-generate && npm run db:seed --workspace=@repo/database && node apps/api/dist/main.js"]
