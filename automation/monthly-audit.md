# Monthly run: site audit → one PR

You are running unattended in a clone of this repo. Changes go to a branch and a
pull request against `develop`. **Never push to `main` or `develop` directly** —
Render deploys `main` automatically.

## 1. Audit the live site (read-only)

- Fetch `https://hexapixora.com/sitemap.xml`; request every URL. List any non-200s.
- For the home page, `/insights` and 5 random posts, check: one `<h1>`, `<title>`
  ≤ 60 chars, meta description present, `og:image` present, images have `alt`,
  and no links to 404s (check internal links only).
- `curl "$HEXA_API_URL/automation/report?days=30"` for a 30-day content/lead summary.

## 2. Check the code

- `npm outdated --workspaces` — note security or major updates only.
- `npm audit --omit=dev` — note high/critical findings.

## 3. Fix (small, safe things only)

Create `chore/monthly-audit-YYYY-MM` from `origin/develop` and fix only what is
clearly safe: broken internal links, missing alt/meta text in code, typos,
**patch/minor** dependency bumps that pass `npm run build` and `npm run check-types`.
Don't change layouts, styles, copy tone, auth, or the database schema, and don't
do major-version upgrades — list those as recommendations instead.

If nothing needs changing, open no PR.

## 4. Report

Open the PR with `gh pr create --base develop` (body: what was fixed, how it was
verified, and a **Recommendations** list for anything needing a human decision).
End the run with a short summary: PR link (or "no changes"), broken URLs found,
SEO issues, dependency/security notes, and the 30-day leads/content numbers.
