# Site automation

Playbooks Claude follows on request — nothing runs 24/7. In Claude Code, type
`/hexa-weekly` or `/hexa-monthly` (user-level skills that point at these files).
The same files also work as prompts for scheduled cloud routines.

| Playbook | Suggested cadence | Writes to |
|---|---|---|
| [weekly.md](weekly.md) | Mondays | Publishes up to 2 posts via the automation API; prints a report |
| [monthly-audit.md](monthly-audit.md) | 1st of the month | Opens a PR against `develop` (never pushes to `main`) |

Shared rules: [style-guide.md](style-guide.md).

## Automation API

Base URL: `$HEXA_API_URL` (e.g. `https://hexapixora-api.onrender.com/api`).
Auth header: `X-Automation-Key: $AUTOMATION_API_KEY`. Code: `apps/api/src/automation/`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/automation/context` | Categories + every existing post (titles, slugs, keywords) |
| POST | `/automation/posts` | Publish (or schedule with `publishAt`) one Markdown post |
| GET | `/automation/report?days=7` | Leads, newsletter, content, API health |

The API can't edit or delete anything, and creates at most 3 posts per 24h.

## Environment variables

Local runs read them from `D:\secrets\hexapixora-automation.env` (`NAME=value`
lines, never committed). Cloud routines set them on the cloud environment.

| Name | Required | Value |
|---|---|---|
| `HEXA_API_URL` | yes | `https://hexapixora-api.onrender.com/api` |
| `AUTOMATION_API_KEY` | yes | Copy from Render → hexapixora-api → Environment |
| `GSC_SERVICE_ACCOUNT_JSON` | no | Search Console service-account key (whole JSON on one line) |
| `GSC_SITE_URL` | no | `sc-domain:hexapixora.com` |
