# HexaPixora — Go-Live & Configuration Guide

Everything you need to take the site from dev → a real, live domain. Follow the
sections **in order**. Anything marked ⚠️ will break the site if skipped.

---

## 0. How the system is wired

| Piece | Runs on | What it is |
|---|---|---|
| **Web / Admin** (Next.js) | **Vercel** | The public site + `/admin` dashboard. Deploys on push to `main`. |
| **API** (NestJS) | **Railway** | Backend: auth, CMS, leads, chat, newsletter, notifications. |
| **Database** | **Supabase** (Postgres) | All data. |
| **Media storage** | **Supabase Storage** | Uploaded images (durable across redeploys). |
| **Transactional email** | **Resend** | Invites, password reset, verify, lead alerts, newsletter. |
| **Domain / DNS** | **Cloudflare** (recommended) | Your domain + DNS + free email forwarding. |

The web app talks to the API through a same-origin `/api` proxy (a Next.js
rewrite), so the browser never calls Railway directly.

**On every Railway deploy** the start command automatically runs
`prisma db push` (applies schema changes) **and** `db:seed` (creates the first
admin *if* `SEED_ADMIN_PASSWORD` is set). So you rarely run migrations by hand.

---

## 1. Buy the domain

**Recommended: [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/)**
— at-cost pricing (~$10/yr `.com`), free WHOIS privacy, free DNS, and free email
forwarding. Alternatives: [Porkbun](https://porkbun.com), [Namecheap](https://namecheap.com).
Avoid GoDaddy (renewal upsells).

1. Search your domain (e.g. `hexapixora.com`) and buy it.
2. If bought elsewhere, point its **nameservers** to Cloudflare (add the site in
   Cloudflare → it gives you 2 nameservers → set them at the registrar).
3. You'll add DNS records in the steps below.

Pick **one** canonical form and use it everywhere: `https://hexapixora.com`
(apex) **or** `https://www.hexapixora.com`. This guide assumes the apex.

---

## 2. Supabase (database + storage)

1. **Database URL** — Supabase → **Project Settings → Database → Connection string → URI**.
   - Use the **Direct connection** (port `5432`) for `DATABASE_URL`.
   - ⚠️ If your password contains special characters (`@ : / ?`), URL-encode them
     (e.g. `@` → `%40`).
2. **Storage bucket** — Supabase → **Storage** → create a bucket named **`media`**
   → set it **Public**. ⚠️ If it isn't public, uploaded images (and OG images)
   won't load for visitors or link crawlers.
3. **Service role key** — Settings → **API → `service_role`** (secret). Used by the
   API to upload media.

You do **not** normally run `prisma db push` yourself — Railway does it on deploy.
(If you ever need to, from `packages/database`: `DATABASE_URL="<prod-uri>" npx prisma db push`.)

---

## 3. Railway (the API)

Railway → your **API service → Variables**. Set:

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | Supabase URI (step 2) | ⚠️ Required. |
| `JWT_ACCESS_SECRET` | long random string | `openssl rand -base64 48` |
| `JWT_REFRESH_SECRET` | **different** long random string | `openssl rand -base64 48` |
| `CORS_ORIGINS` | `https://hexapixora.com` | Comma-separate if multiple. |
| `APP_URL` | `https://hexapixora.com` | ⚠️ Base for magic-link emails. |
| `SUPABASE_URL` | `https://<ref>.supabase.co` | From Supabase API settings. |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (step 2) | Media uploads. |
| `SUPABASE_STORAGE_BUCKET` | `media` | Must match the bucket. |
| `SEED_ADMIN_EMAIL` | your admin login email | e.g. your Gmail. |
| `SEED_ADMIN_PASSWORD` | a strong password (≥8) | Only used to create the first admin. |
| `SEED_ADMIN_NAME` | `Administrator` | Optional. |
| `RESEND_API_KEY` | `re_…` (step 5) | Email. Optional but needed for invites/reset. |
| `MAIL_FROM` | `HexaPixora <noreply@hexapixora.com>` | Must be a **verified** Resend sender (step 5). |
| `LEADS_NOTIFY_TO` | email to receive lead alerts | Optional (falls back to settings). |
| `AI_API_KEY` | Groq/OpenAI-compatible key | Chatbot AI. Optional. |
| `VAPID_PUBLIC_KEY` | see step 6 | Web Push. Optional. |
| `VAPID_PRIVATE_KEY` | see step 6 | Web Push. Optional. |
| `VAPID_SUBJECT` | `mailto:you@hexapixora.com` | Web Push. |

> Railway sets `PORT` itself — don't add it.

**Custom API domain (optional but recommended):** Railway → service → **Settings →
Networking → Custom Domain** → `api.hexapixora.com` → add the shown `CNAME` in
Cloudflare DNS. Otherwise use the default `*.up.railway.app` URL.

---

## 4. Vercel (the web/admin)

Vercel → your project → **Settings → Environment Variables** (scope: **Production**,
and Preview if you want):

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://hexapixora.com` | ⚠️ OG images + canonical URLs. |
| `API_URL` | `https://api.hexapixora.com/api` *(or your `*.up.railway.app/api`)* | ⚠️ The `/api` proxy target — points the web app at the Railway API. |

> `NEXT_PUBLIC_*` variables are baked at **build time** — after changing them you
> must **redeploy** for them to take effect.

**Connect the domain:** Vercel → **Settings → Domains** → add `hexapixora.com`
(and `www` if you want it to redirect) → follow Vercel's DNS instructions (add the
`A` / `CNAME` records in Cloudflare). Set your canonical domain as **Primary**.

---

## 5. Resend (email)

Because the built-in `onboarding@resend.dev` sender only delivers to *your own
Resend account email*, you must verify your domain to email anyone.

1. Sign up / log in at [resend.com](https://resend.com). (GitHub sign-in is fine —
   your account email = your GitHub email.)
2. **Domains → Add Domain** → `hexapixora.com`.
3. Resend shows **SPF, DKIM, DMARC** DNS records → add them in **Cloudflare DNS**
   → click **Verify** (takes minutes).
4. **API Keys → Create** → copy the `re_…` key → set `RESEND_API_KEY` in Railway.
5. Set `MAIL_FROM` in Railway to a verified address, e.g.
   `HexaPixora <noreply@hexapixora.com>`.

To also **receive** email at your domain: Cloudflare → **Email → Email Routing** →
forward `hello@hexapixora.com` → your Gmail (free). Or use Zoho Mail / Google
Workspace for real mailboxes.

---

## 6. VAPID keys (Web Push notifications)

Generate a fresh keypair (⚠️ don't reuse any keys shared in chat/dev):

```bash
npx web-push generate-vapid-keys
```

Set in **Railway**: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`,
`VAPID_SUBJECT=mailto:you@hexapixora.com`. The web app fetches the public key from
the API automatically — no Vercel env needed. (No keys = push simply disabled;
the in-app bell still works.)

---

## 7. Deploy

1. Make sure every variable above is set.
2. Push to `main` (or click **Redeploy** in Vercel + Railway). Both auto-build.
3. Railway's start command runs `prisma db push` (schema) + `db:seed` (first admin)
   automatically.
4. Wait for **both** dashboards to go green.

---

## 8. Post-deploy verification checklist

Do these on the **live** domain:

- [ ] Home page and a CMS page load.
- [ ] `/insights` loads; a post opens at `/insights/<category>/<slug>`; an old
      `/blog/...` or `/category/...` link **301-redirects** to the new URL.
- [ ] `/admin` login works with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.
- [ ] Upload an image in Admin → Media → it displays (Supabase storage works).
- [ ] Submit the site **contact form** → a lead appears in Admin → Leads (+ email
      alert if Resend is set).
- [ ] Subscribe via the **footer** → appears in Admin → Newsletter.
- [ ] Admin → Newsletter → **send a test campaign** to yourself → it arrives.
- [ ] Admin → **Profile → change email / password** → the magic-link email arrives.
- [ ] Admin → **Users → invite** a teammate → they get an invite email.
- [ ] Bell → **Enable desktop notifications** → trigger a lead → you get a push.
- [ ] Share a page link on social → the **OG image** shows (re-scrape with the
      [Facebook debugger](https://developers.facebook.com/tools/debug/) /
      [LinkedIn inspector](https://www.linkedin.com/post-inspector/)).
- [ ] `https://hexapixora.com/sitemap.xml` and `/robots.txt` load.

---

## 9. Security checklist

- [ ] `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are long, random, and **different**.
- [ ] **Rotate the Supabase DB password** if it was ever shared, and update
      `DATABASE_URL` in Railway.
- [ ] Supabase `service_role` key is only in Railway (never in the web app / git).
- [ ] `.env` files are gitignored (they are) — never commit real secrets.
- [ ] HTTPS everywhere (Vercel + Railway provide it automatically).

---

## 10. Optimizations (safe to do AFTER launch)

These aren't blockers — the site is correct and fast enough to launch. Consider
them as traffic grows:

1. **Server load / cost.** The public content routes render **live on every
   request** (`force-dynamic`) so admin edits appear instantly. That means each
   page view = one Vercel function + one API call + one DB query. Fine at low/
   moderate traffic. If traffic grows, switch the public pages to **ISR**
   (`export const revalidate = 60` + on-save revalidation) to serve cached HTML
   and cut API/DB load dramatically.
2. **Image optimization.** The public site uses plain `<img>` tags (~21). Moving
   to `next/image` (with `images.remotePatterns` allowing your Supabase host)
   gives automatic resizing, lazy-loading, and modern formats — better Core Web
   Vitals and lower bandwidth.
3. **Lint cleanup.** `npm run lint` reports style-only warnings (`any` types,
   empty catch blocks, one `<a>`→`<Link>`). None affect runtime; tidy at leisure.

---

## 11. Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| Admin login 500s after deploy | Schema not applied — check Railway deploy logs for the `prisma db push` step. |
| OG image is blank / localhost | `NEXT_PUBLIC_SITE_URL` not set on Vercel (redeploy after setting), or Supabase bucket not public. Re-scrape on the platform. |
| Emails never arrive | `RESEND_API_KEY` missing, or `MAIL_FROM` domain not verified in Resend, or (test sender) recipient ≠ your Resend account email. |
| Push never fires | VAPID keys not set in Railway; on iPhone the site must be **installed as a PWA** (Add to Home Screen). |
| Images upload but vanish on redeploy | Supabase Storage not configured — the API fell back to ephemeral disk. Set `SUPABASE_*` vars. |
| `/api/...` calls fail on the live site | `API_URL` on Vercel is wrong — must be the Railway API origin + `/api`. |

---

### Quick env cheat-sheet (who needs what)

- **Railway (API):** `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`,
  `CORS_ORIGINS`, `APP_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
  `SUPABASE_STORAGE_BUCKET`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`,
  `RESEND_API_KEY`, `MAIL_FROM`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`,
  `VAPID_SUBJECT` (+ optional `LEADS_NOTIFY_TO`, `AI_API_KEY`).
- **Vercel (web):** `NEXT_PUBLIC_SITE_URL`, `API_URL`.
- **Cloudflare (DNS):** records for Vercel (domain), Railway (api subdomain),
  Resend (SPF/DKIM/DMARC), optional Email Routing.
