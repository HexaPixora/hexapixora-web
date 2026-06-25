# Deploying HexaPixora (free, no domain needed)

Three free services, real HTTPS subdomains, works on every device:

| Piece | Host | Free subdomain |
|-------|------|----------------|
| Postgres | **Supabase** | — |
| API (NestJS) | **Railway** | `*.up.railway.app` (`railway.json` included) |
| Web (Next.js) | **Vercel** | `*.vercel.app` |

**Key idea:** the browser never calls the API cross-origin. Vercel's `/api/*`
rewrite (in `apps/web/next.config.js`) proxies to the Railway API, so to the
browser everything is **same-origin HTTPS** — login cookies and CORS just work.

> Drop-in alternatives: **Neon** instead of Supabase, **Render** instead of
> Railway (`render.yaml` is also included). The steps are identical apart from
> the dashboard.

---

## 1. Database — Supabase
1. Create a project at <https://supabase.com> (free). Pick a region close to your
   Railway region. Save the database password you set.
2. **Connect → "Session pooler"** and copy that connection string, then **append
   `?connection_limit=5`**. It should look like:
   `postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres?connection_limit=5`
   Keep it for Railway's `DATABASE_URL`.

   ⚠️ **The `?connection_limit=5` is required.** Supabase's pooler caps total
   client connections at 15; Prisma's default pool is sized to the container's
   CPU count and will hog all 15 by itself, which then makes the *next* deploy's
   `prisma db push` fail with `EMAXCONNSESSION`. Capping it leaves room for
   redeploys. (If it ever recurs, lower it to `3`.)

   ⚠️ **Use the *Session* pooler (port 5432), not the Transaction pooler (6543)
   and not the `db.<ref>.supabase.co` direct string.** The direct host is
   IPv6-only (Railway can't reach it on the free plan), and the transaction
   pooler has Prisma caveats. The session pooler is IPv4 and supports everything
   Prisma needs (migrations, transactions) with **no extra flags**.

## 2. API — Railway
1. <https://railway.com> → **New Project → Deploy from GitHub repo** → pick
   `HexaPixora/hexapixora-web`. Railway reads `railway.json` for the build/start.
2. **Variables** (Settings → Variables) — Railway does NOT auto-generate secrets,
   so set them all:
   ```
   NODE_ENV=production
   DATABASE_URL=<the Supabase session-pooler string from step 1>
   JWT_ACCESS_SECRET=<openssl rand -base64 48>
   JWT_REFRESH_SECRET=<openssl rand -base64 48>
   PREVIEW_TOKEN=<openssl rand -hex 32>          # Vercel needs the same value
   SEED_ADMIN_EMAIL=you@example.com               # first admin (see step 5)
   SEED_ADMIN_PASSWORD=<a strong password>
   CORS_ORIGINS=https://<your-project>.vercel.app # set after step 3
   # optional: AI_API_KEY, RESEND_API_KEY, MAIL_FROM
   ```
   Do **not** set `PORT` — Railway injects it and the API reads it automatically.
3. **Settings → Networking → Generate Domain** → gives `https://<name>.up.railway.app`.
   That's your API URL.
4. Railway builds (`prisma generate` + `nest build`) then starts
   (`prisma db push` creates the schema → `prisma db seed` creates the first admin
   → boots). Health check: `/api`. Watch the deploy logs until it's live.
5. **First admin login** is created by the seed, idempotently, from
   `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` — only if that email doesn't exist
   yet (it never clobbers a password you later change). Log in at the Vercel URL
   once step 3 is done.

   ⚠️ **Uploaded media is stored on the API's disk, which is ephemeral on Railway
   — files vanish on every redeploy.** To keep them, add a **Volume** (Railway →
   your service → **+ Volume**) mounted at **`/app/uploads`**. (The proper
   long-term fix is object storage, e.g. Supabase Storage — ask and I'll wire it.)

## 3. Web — Vercel
1. <https://vercel.com> → **Add New → Project** → import the same repo.
2. **Root Directory:** `apps/web` (Vercel auto-installs the npm workspace from the
   repo root). Framework: **Next.js** (auto-detected). No `DATABASE_URL` — the web
   app never touches Prisma.
3. **Environment Variables:**
   ```
   API_URL=https://<name>.up.railway.app/api          # server fetches + /api proxy target
   NEXT_PUBLIC_API_URL=/api                            # browser → same-origin → proxied
   NEXT_PUBLIC_SITE_URL=https://<your-project>.vercel.app
   PREVIEW_TOKEN=<same value set on Railway>
   # optional, enables realtime chat:
   NEXT_PUBLIC_WS_ORIGIN=https://<name>.up.railway.app
   ```
4. Deploy, then open the Vercel URL on any device.
5. Go back to Railway and set `CORS_ORIGINS` to this Vercel URL (redeploys the API).

---

## Updating
Both hosts auto-deploy on push to the default branch. Schema changes apply
automatically via `prisma db push` on the next API deploy.

## Notes / limits
- **Media persistence:** see the Railway volume note above.
- **Chat realtime:** websockets bypass the Vercel proxy and hit Railway directly,
  so `NEXT_PUBLIC_WS_ORIGIN` + `CORS_ORIGINS` must be set. Visitor chat works as-is;
  agent (logged-in) realtime additionally needs cross-site cookies.
- **Custom domain (later):** add it in Vercel, point DNS, and update
  `NEXT_PUBLIC_SITE_URL` (and `CORS_ORIGINS` on Railway) to match.
- This is a **free-tier** path; nothing here costs money.
