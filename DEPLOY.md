# Deploying HexaPixora (free staging)

Three free services, real HTTPS domains, works on every device:

| Piece | Host | Why |
|-------|------|-----|
| Postgres | **Neon** | free serverless Postgres |
| API (NestJS) | **Render** | long-running server + websockets; `render.yaml` included |
| Web (Next.js) | **Vercel** | best Next.js host; proxies `/api/*` to the API |

**Key idea:** the browser never calls the API cross-origin. Vercel's `/api/*`
rewrite (in `apps/web/next.config.js`) proxies to the Render API, so to the
browser everything is **same-origin HTTPS** — login cookies and CORS just work.

---

## 1. Database — Neon
1. Create a project at <https://neon.tech> (free).
2. Copy the **pooled** connection string (looks like
   `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require`).
   Keep it for Render's `DATABASE_URL`.

## 2. API — Render
1. <https://render.com> → **New → Blueprint** → connect the GitHub repo
   `HexaPixora/hexapixora-web`. Render reads `render.yaml` and creates
   **hexapixora-api**.
2. Set the secrets it asks for (the `sync: false` ones):
   - `DATABASE_URL` = the Neon string from step 1
   - `CORS_ORIGINS` = your Vercel URL (set after step 3, e.g.
     `https://hexapixora.vercel.app`) — only needed for the chat websocket
   - `PREVIEW_TOKEN` = run `openssl rand -hex 32`, save it (Vercel needs the same value)
   - `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` = the first admin login to create
     (see step 5). Set both, or leave unset to skip seeding.
   - `AI_API_KEY`, `RESEND_API_KEY`, `MAIL_FROM` — optional
   - `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` are auto-generated.
3. Deploy. Build runs `prisma generate` + `nest build`; start runs
   `prisma db push` (creates the schema on Neon) → `prisma db seed` (creates the
   first admin) → boots. Health checks: `/api` (liveness) and `/api/health`
   (readiness, includes a DB ping).
4. Note the URL, e.g. `https://hexapixora-api.onrender.com`.
5. **First admin login.** The seed runs automatically on every deploy and is
   **idempotent**: it creates a `SUPER_ADMIN` from `SEED_ADMIN_EMAIL` /
   `SEED_ADMIN_PASSWORD` only if that email doesn't already exist (so it never
   clobbers a password you later change). Set both env vars (step 2) and deploy,
   then log in. To seed manually instead (Render shell or locally):
   ```sh
   SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD='a-strong-password' \
     npm run db:seed --workspace=@repo/database
   ```

   *(Free Render instances sleep when idle — the first request after a while takes ~50s.)*

## 3. Web — Vercel
1. <https://vercel.com> → **Add New → Project** → import the same repo.
2. **Root Directory:** `apps/web` (Vercel auto-installs the npm workspace from the
   repo root). Framework: **Next.js** (auto-detected). No DATABASE_URL needed — the
   web app never touches Prisma.
3. **Environment Variables:**
   ```
   API_URL=https://hexapixora-api.onrender.com/api      # server fetches + /api proxy target
   NEXT_PUBLIC_API_URL=/api                              # browser → same-origin → proxied
   NEXT_PUBLIC_SITE_URL=https://<your-project>.vercel.app
   PREVIEW_TOKEN=<same value set on Render>
   # optional, enables realtime chat:
   NEXT_PUBLIC_WS_ORIGIN=https://hexapixora-api.onrender.com
   ```
4. Deploy. Open the Vercel URL on any device — dark theme, mobile menu, and login
   all work over HTTPS.
5. Go back to Render and set `CORS_ORIGINS` to this Vercel URL (then redeploy the
   API) if you enabled the chat websocket.

---

## Updating
Both hosts auto-deploy on push to the default branch. Schema changes apply
automatically via `prisma db push` on the next API deploy.

## Notes / limits
- **Chat realtime:** websockets bypass the Vercel proxy and hit Render directly,
  so `NEXT_PUBLIC_WS_ORIGIN` + `CORS_ORIGINS` must be set. Agent (logged-in)
  realtime additionally needs cross-site cookies; visitor chat works as-is.
- **Custom domain:** add it in Vercel, point DNS, update `NEXT_PUBLIC_SITE_URL`
  (and `CORS_ORIGINS` on Render) to match.
- This is the **staging** path. For production, move off free tiers (Render
  paid to avoid cold starts, Neon scale).
