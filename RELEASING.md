# Releasing

Versions are fully automated with [semantic-release](https://semantic-release.gitbook.io/).
Every green push to a release branch reads the commit messages since the last
tag, picks the next version, and publishes a git tag + GitHub Release with
generated notes. Nothing is committed back and nothing is published to npm.

## Channels

| Branch    | Channel  | Example tag       | Deploys to                       |
| --------- | -------- | ----------------- | -------------------------------- |
| `main`    | stable   | `v1.4.0`          | Production (Vercel + Render)     |
| `develop` | beta     | `v1.4.0-beta.3`   | Vercel preview / staging         |
| `alpha`   | unstable | `v1.5.0-alpha.1`  | Vercel preview (experiments)     |

Flow: `feature/*` → PR → `develop` (beta) → PR → `main` (stable).
After each stable release the `sync-develop` CI job merges `main` back into
`develop`, so the new tag is in develop's history and the next beta starts
from it (`v1.1.0-beta.1`, not `v1.0.0-beta.N`). Merge `develop` → `main` with a
**merge commit**, never squash.
Use `alpha` for risky work that shouldn't block the beta line; it is created
on demand (`git switch -c alpha develop && git push -u origin alpha`).

## How the version is chosen

| Commit message                                     | Bump  |
| -------------------------------------------------- | ----- |
| `fix: …`, `perf: …`, `revert: …`                   | patch |
| `chore(deps): …`, `build(deps): …` (security bumps)| patch |
| `feat: …`                                          | minor |
| `feat!: …` or a `BREAKING CHANGE:` footer          | major |
| `docs:`, `chore:`, `refactor:`, `test:`, `ci:`, `style:` | none |

PR commits are checked by commitlint (`commitlint.config.mjs`), so a
non-conforming message fails CI before it can reach a release branch.

## Config

- `.releaserc.json` — branches/channels, bump rules, release-note sections.
- `.github/workflows/ci.yml` — `commitlint` (PRs), `build`, `release` (pushes).

To preview the next version locally without publishing (needs a
`GITHUB_TOKEN` with push access to the repo in your environment):

```bash
npx -p semantic-release@25.0.9 -p conventional-changelog-conventionalcommits@9.3.1 \
  semantic-release --dry-run --no-ci
```
