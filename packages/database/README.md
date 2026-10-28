# @repo/database

Prisma schema, migrations and seed for the API.

## Changing the schema

1. Edit `prisma/schema.prisma`.
2. Create a migration against your **local** database:
   ```bash
   npm run db:migrate --workspace=@repo/database -- --name <short_snake_case_name>
   ```
3. Read the generated `prisma/migrations/<timestamp>_<name>/migration.sql`. Renames
   and dropped columns lose data unless you edit the SQL to copy it first.
4. Commit the schema and the migration folder together.

## Deploying a migration

Set `RUN_DB_SETUP=1` on the API service for the deploy that ships the migration.
The container runs `prisma migrate deploy` (only pending migrations, never a
reset) and the seed, then starts. Set it back to `0` afterwards.

Check what production has applied:
```bash
npm run db:status --workspace=@repo/database   # with DATABASE_URL pointing at production
```

## Rules

- Never use `prisma db push` or `migrate reset` against production.
- Never edit a migration that has already been applied anywhere; add a new one.
- `0_init` is the baseline of the schema as it was in production on 2026-10-28.
