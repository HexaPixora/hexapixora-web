# HexaPixora

A self-hosted, headless CMS + marketing site for a digital agency — a visual
page builder, blog, leads/CRM, newsletter, live support chat (with optional AI),
booking links, draft preview, and granular team-member permissions. Built to run
entirely on **free tiers** (no paid APIs or services required).

## Stack
- **Web** (`apps/web`) — Next.js 16 (App Router, React 19), Tailwind v4, shadcn-style UI. Public site + `/admin`.
- **API** (`apps/api`) — NestJS 11, JWT auth (access/refresh, httpOnly cookies), role + per-section permissions.
- **Database** (`packages/database`) — Prisma 6 + PostgreSQL.
- Monorepo via **Turborepo** + npm workspaces.

## Architecture (one-origin design)
The browser never calls the API cross-origin. The web app proxies `/api/*` to the
NestJS server (see `apps/web/next.config.js`), so to the browser everything is
**same-origin HTTPS** — cookies and CORS "just work". Server Components fetch the
API directly via `API_URL`.

```
Browser ──▶ Next.js (Vercel)  ──/api/* rewrite──▶  NestJS (Render) ──▶ Postgres (Neon)
                │
                └── Server Components fetch API_URL directly (server-side)
```

## Monorepo layout
```
apps/
  web/    Next.js public site + admin dashboard
  api/    NestJS REST API (auth, CMS, chat, leads, mail, preview, …)
packages/
  database/          Prisma schema, client, seed
  ui/                shared React components
  eslint-config/     shared ESLint config
  typescript-config/ shared tsconfig
```

## Local development
**Prerequisites:** Node ≥ 18, npm, a PostgreSQL database (local or a free Neon URL).

```sh
# 1. Install
npm install

# 2. Configure env (copy the examples and fill in values)
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp packages/database/.env.example packages/database/.env   # set DATABASE_URL (+ SEED_ADMIN_*)

# 3. Create the schema and the first admin
npm run db:push  --workspace=@repo/database
npm run db:seed  --workspace=@repo/database   # needs SEED_ADMIN_PASSWORD set

# 4. Run everything (web :3000, api :3001)
npm run dev
```

Open http://localhost:3000 (site) and http://localhost:3000/admin (dashboard).

## Scripts (run from the repo root)
| Command | What it does |
|---|---|
| `npm run dev` | Web + API in watch mode (Turborepo) |
| `npm run build` | Production build of both apps |
| `npm run check-types` | Type-check both apps |
| `npm run lint` | Lint both apps |
| `npm run db:push --workspace=@repo/database` | Apply the Prisma schema |
| `npm run db:seed --workspace=@repo/database` | Create the first SUPER_ADMIN (idempotent) |
| `npm run db:studio --workspace=@repo/database` | Prisma Studio |

## Deploy
Free-tier path (Neon + Render + Vercel) is documented in **[DEPLOY.md](DEPLOY.md)**.
CI (`.github/workflows/ci.yml`) type-checks and builds both apps on every push/PR.

## Smoke test (after a deploy or major change)
1. **Login** at `/admin` with the seeded admin.
2. **Health:** `GET /api/health` returns `{ "status": "ok", "db": "up" }`.
3. **Pages:** create a page, add a module, save, view it on the public site.
4. **Blog:** create + publish a post; it appears at `/blog`.
5. **Media:** upload an image; "copy URL" resolves on the site.
6. **Leads:** submit the public contact form → it appears in `/admin/leads`.
7. **Permissions:** create a TEAM_MEMBER with one section; confirm the sidebar
   and write actions are limited to that section.
8. **Chat / preview / booking:** exercise if those env vars are configured.

## Notes
- **No paid dependencies.** Postgres → Neon · API → Render free · Web → Vercel hobby ·
  chat AI → Groq free (OpenAI-compatible, swappable) · email → Resend free.
- Ongoing polish is tracked in **[POLISH_PLAN.md](POLISH_PLAN.md)**.
