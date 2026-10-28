# API image (NestJS + Prisma), deployed on Northflank; runs on any container
# host (Koyeb, Fly, a VPS...).
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

# Start lean: on small free instances (256 MB) the schema sync and seed steps can
# exhaust memory. Set RUN_DB_SETUP=1 for a deploy that needs them (new database,
# schema change); otherwise only the API starts.
ENV RUN_DB_SETUP=0
CMD ["sh", "-c", "if [ \"$RUN_DB_SETUP\" = 1 ]; then npx prisma db push --schema=packages/database/prisma/schema.prisma --skip-generate && npm run db:seed --workspace=@repo/database; fi; exec node --max-old-space-size=192 apps/api/dist/main.js"]
