# Weekly run: trends → 2 posts → report

You are running unattended. Be economical: don't explore the codebase — this
file, `style-guide.md` and the API are all you need. Finish in one pass.

## 0. Setup

```bash
# Local runs: secrets live outside git. Cloud runs: already in the environment.
[ -f /d/secrets/hexapixora-automation.env ] && set -a && . /d/secrets/hexapixora-automation.env && set +a
API="$HEXA_API_URL"; KEY="$AUTOMATION_API_KEY"
h() { curl -sS --retry 4 --retry-delay 15 --retry-all-errors -m 90 -H "X-Automation-Key: $KEY" "$@"; }
h "$API/automation/context" > /tmp/context.json   # Render free tier may cold-start (~60s)
```

If either variable is missing or the call fails after retries, stop and report the error.

## 1. Pick topics

1. **Search Console (if `GSC_SERVICE_ACCOUNT_JSON` is set):** pull the last 28 days
   of queries for `$GSC_SITE_URL` (Search Analytics API, dimensions `query,page`,
   rowLimit 500) with a short Python script (`pip install google-auth requests`).
   Look for queries with impressions but position > 10 or CTR < 2% — these are
   topics Google already associates with us that deserve a dedicated post.
2. **Trends:** 3–5 web searches for what changed in the last 2 weeks across the
   pillars in `style-guide.md` (e.g. new AI tools businesses are adopting, Google
   search/core updates, hosting/pricing changes, e-commerce platform news).
3. Choose **2 topics** that (a) fit a pillar, (b) a business owner would search
   for, and (c) are not already covered — compare against every title, slug and
   `metaKeywords` in `/tmp/context.json`. Prefer one evergreen "how/what/should I"
   topic and one timely topic. If nothing passes, publish fewer; never pad.

## 2. Write and publish

For each topic, write the post following `style-guide.md` exactly.

**Featured image (required).** Generate one original image per post following the
*Images* section of `style-guide.md` — locally via the ComfyUI MCP (`comfy-mcp`,
port 8188) with `D:\AI-Umair\comfy-workflows\blog-header-zimage-t2i.json`
(Z-Image Turbo, 1600×896): copy it, replace `SUBJECT HERE` in node 4, make 2 seeds,
look at both and keep the better one. If ComfyUI isn't running, launch it with
`--extra-model-paths-config D:\AI-Umair\comfy-workflows\extra_model_paths.yaml`
(otherwise it can't see the Desktop models). Convert to WebP (quality 85), then upload:

```bash
h -X POST "$API/automation/media" -F "file=@/tmp/post1.webp;type=image/webp"
# → {"url": "..."}  use it as "thumbnail" in the post body
```

If image generation is unavailable, publish anyway, say so in the report, and
attach it later with `PATCH $API/automation/posts/<slug>/image` (`{"url": "..."}`).

Save the JSON body to a file, then:

```bash
h -X POST "$API/automation/posts" -H "Content-Type: application/json" --data @/tmp/post1.json
```

Body fields: `title, slug, markdown, excerpt, thumbnail, metaTitle, metaDescription,
metaKeywords, categories, tags, faq: [{question, answer}]`. Publish the first post
now; give the second `publishAt` = Thursday 10:00 Asia/Karachi this week (ISO,
UTC) so traffic is spread out.

- `400` → fix the fields named in the error and retry once.
- `409` (slug exists) → pick a different angle, don't overwrite.
- `429` (daily cap) → stop publishing.

Before posting, self-check: no invented facts or stats, every external claim has a
link, internal links point to slugs that exist in the context file, word count in range.

## 3. Report

```bash
h "$API/automation/report?days=7"
```

Finish with a short report (this is what the owner reads):

- **Published:** titles + URLs (and the scheduled one with its time), each with its image
- **Why these topics:** one line each (search data or trend source)
- **Leads this week:** count, then one line per lead — name, type, country, 1-line
  gist of the message, and a suggested next step. Flag anything still `NEW` older than 3 days.
- **Newsletter:** new / total active subscribers
- **Health:** DB latency, memory; flag DB latency > 1000 ms or any failed call
- **Topic ideas for next week** (3 bullets)
