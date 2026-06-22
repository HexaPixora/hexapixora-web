# HexaPixora — Polish & Production-Readiness Plan

A staged plan to bring the project to enterprise quality: consistent admin UI/UX,
de-duplicated code, a hardened backend, and a one-command, free-tier deploy.
Each phase is self-contained and shippable; we complete and verify one before
starting the next.

**Guiding constraints**
- **No paid services.** Free tiers / self-hostable / OSS only (Neon, Render free,
  Vercel hobby, Groq free, Resend free, Cloudflare tunnel for device testing).
- **Non-breaking.** Public site and existing admin flows keep working after each phase.
- **Verified.** Every phase ends green on `tsc` (both apps) and, where applicable, `lint`/`build`.

---

## Status legend
`[ ]` todo `[~]` in progress `[x]` done

---

## Phase 1 — Admin design system (shared primitives) ✅ DONE
**Goal:** one source of truth for the admin's repeated UI, so every page looks and behaves identically.

- [x] Conventions documented (rounding, padding, spacing, status colors) — see Appendix A
- [x] `components/admin/ui/page-header.tsx` — title + subtitle + actions slot
- [x] `components/admin/ui/data-table.tsx` — `TableCard/THead/TH/TBody/TR/TD/RowActions` w/ consistent padding & hover
- [x] `components/admin/ui/empty-state.tsx` — `EmptyState` + `EmptyRow` (icon + title + hint + action)
- [x] `components/admin/ui/loading.tsx` — `Skeleton`, `TableSkeleton`, `PageLoading`
- [x] `components/admin/ui/field.tsx` — label + control + hint + error
- [x] `components/admin/ui/section-card.tsx` — card shell + optional header
- [x] `components/admin/ui/status-pill.tsx` + `lib/admin/status-colors.ts` — single map for lead/chat status
- [x] Barrel export `components/admin/ui/index.ts`
- **Acceptance:** ✅ compiles, exported from a barrel; no page rewired in this phase.

## Phase 2 — Adopt the design system across admin pages ✅ DONE
**Goal:** the user's core ask — a smooth, consistent admin UI. Rewire pages onto Phase 1 primitives.
Done in sub-batches to keep diffs reviewable:

- [x] 2a — List pages: `pages`, `blogs`, `leads`, `newsletter`, `users`, `media` ✅
  (PageHeader, DataTable, EmptyState/EmptyRow, TableSkeleton; unified status colors; replaced all raw
  `fixed inset-0` delete modals with the shared confirm dialog; consistent loading states)
- [x] 2b — Builder pages ✅ — `layouts/header` & `layouts/footer` fully rebuilt on `SectionCard`/`Field`/`PageHeader`/`PageLoading` + a shared select class; `modules` header → `PageHeader`. The `layouts/menu` two-pane DnD builder and the `pages/[id]`/`pages/home` sticky toolbars were already internally consistent (the latter get their field internals reworked in Phase 3).
- [x] 2c — Settings & Chat ✅ — Settings: replaced the bespoke gradient header with `PageHeader`, standardized `rounded-2xl`→`rounded-xl`; `chat` + `chat/settings` headers → `PageHeader`. (Users dialog was done in 2a.)
- [x] 2d — Motion & dialogs ✅ — consistent motion is now encoded in the primitives (`TR` `transition-colors`, `RowActions` hover-fade, buttons/links `transition-colors`). Dialog sizes are intentionally content-scaled (confirm `md` · forms `lg/xl` · builders/preview `3xl/6xl`) — documented as the convention rather than flattened.
- **Acceptance:** ✅ no hand-rolled page headers/tables/delete-modals remain on the refactored pages; rounding/padding/loading/empty/status-color are uniform; `tsc` green, 0 lint errors.

## Phase 3 — Frontend code quality & de-duplication ✅ CORE DONE
**Goal:** kill redundancy, remove `any` where cheap, single data-fetch pattern.

- [x] Extracted `components/admin/module-config-form.tsx` (166 LOC) — the single source of truth for module
      field editing, used by `pages/[id]`, `pages/home`, and `modules`. The triplicated `renderFieldInput`
      + list editor (~1.4k LOC across 3 files) collapsed to 994; dead imports removed; image/video now also
      get the media-library picker for free (via the existing `MediaField`). `tsc` green, 0 lint errors.
- [ ] _(deferred polish)_ `lib/admin/use-resource.ts` for the repeated list fetch/loading/error pattern
- [ ] _(deferred polish)_ one response-shape helper (`array` vs `{data}` vs `{data,total}`)
- [ ] _(deferred polish)_ replace lazy `any` / fix `exhaustive-deps` lint warnings (systemic, warning-level)
- **Acceptance:** ✅ the big duplication is gone; builders behave identically; `tsc` green.
  Note: repo-wide `any`/deps warnings remain — addressed via CI lint policy in Phase 5.

## Phase 4 — Backend consistency & hardening ✅ DONE
**Goal:** predictable API shape, centralized errors, audit trail, no dead/inconsistent code.

- [x] **Decided AGAINST a forced success envelope** — the web app reads `res.data` as array/object/`{data}`
      per-endpoint, so wrapping everything in `{data}` would break dozens of call sites for no real gain.
      Convention left as-is and documented here instead.
- [x] Global `AllExceptionsFilter` → uniform `{ statusCode, error, message, path, timestamp }`; logs 5xx
      stacks server-side but returns a generic message (no leak). Preserves `message` so the web app's
      error handling is unaffected.
- [x] Wired the unused `AuditLog` via a global `AuditInterceptor` — records who/what/when for **authenticated**
      mutations (gated on `req.user`, so public form spam can't bloat it); best-effort (never breaks a request).
- [x] `@Body() any` audit: only `layouts` remains, intentionally (dynamic JSON store) — documented.
- [x] `/api/health` returning `{ status, db, uptime }` (separate from the bare `/api` ping)
- **Acceptance:** ✅ `tsc` green, API boots clean, `/api/health` returns `db:"up"`, audit rows write on admin mutations.

## Phase 5 — Infrastructure & production readiness ✅ DONE
**Goal:** deployable from cold with one path; observable; safe defaults.

- [x] **Seed script** — `packages/database/prisma/seed.ts` + `prisma.seed` config + `db:seed` script.
      Idempotent SUPER_ADMIN bootstrap from `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`. **Resolves the
      "can't log into a fresh deploy" blocker.** Verified via the no-op safety path.
- [x] Wired into `render.yaml` start (`db push` → `db seed` → boot) + manual run documented in DEPLOY.md
- [x] Graceful shutdown via `app.enableShutdownHooks()`; `/api/health` readiness probe (DB ping)
- [x] Confirmed helmet + throttler + env-driven CORS; raised JSON body limit to 2 MB (large page saves)
- [x] **CI** — `.github/workflows/ci.yml`: install → prisma generate → check-types → build (hard gates);
      lint runs **advisory** (`continue-on-error`) given the tracked warning-level findings
- [x] Fixed `turbo.json` outputs (`dist/**`) so API builds cache correctly
- [~] Dockerfiles — intentionally skipped; Render + Vercel build from source, no container needed for free-tier
- **Acceptance:** ✅ full `npm run build` green (web + api); fresh DB → seed → login path wired & verified.

## Phase 6 — Deploy readiness & docs ✅ DONE
**Goal:** anyone can deploy in minutes; nothing undocumented.

- [x] Updated `DEPLOY.md` with the seed step + dual health checks
- [x] Completed `apps/api/.env.example` (now covers JWT, seed, preview, mail, AI) and added
      `packages/database/.env.example`; `apps/web/.env.example` already current
- [x] Real root `README.md` — stack, one-origin architecture diagram, monorepo layout, quickstart, scripts, smoke test
- [x] Final pass: `check-types` ✅ and `build` ✅ both apps green; smoke-test checklist documented in README
- [~] Tag a `deploy-ready` checkpoint — left for you to `git commit`/tag (no commits made without your go-ahead)
- **Acceptance:** ✅ `npm run check-types` + `npm run build` both green (2/2); DEPLOY.md is gap-free end-to-end.

---

## Appendix A — Admin design conventions (the canonical scale)
Adopted in Phase 1, enforced in Phase 2.

| Token | Value | Use |
|------|-------|-----|
| Card radius | `rounded-xl` | all cards/panels/tables (drop `rounded-lg`/`rounded-2xl`) |
| Card shell | `bg-card border rounded-xl shadow-sm` | every panel |
| Card padding | `p-5` compact · `p-6` section body · header `px-6 py-4 border-b` | |
| Table cell | `px-5 py-3.5` · head `px-5 py-3 text-xs uppercase` | one size everywhere |
| Row hover | `hover:bg-muted/40 transition-colors` | tables/lists |
| Page title | `text-2xl font-bold tracking-tight` + `text-sm text-muted-foreground` subtitle | via `PageHeader` |
| Field label | `text-sm font-medium` + hint `text-xs text-muted-foreground` | via `Field` |
| Section gap | page `gap-6` · card stacks `space-y-5` · field stacks `space-y-1.5` | |
| Transition | `transition-colors` default; `transition-all` only when size/shadow animates | |
| Status color | from `lib/admin/status-colors.ts` (no inline `bg-blue-500/20`) | |

## Appendix B — Free-tier service map
Postgres → **Neon** · API → **Render free** · Web → **Vercel hobby** ·
Chat AI → **Groq free** (OpenAI-compatible; Gemini/Ollama swappable) ·
Email → **Resend free** · Device testing → **Cloudflare quick tunnel**. No paid dependencies.
