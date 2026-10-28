# @hexapixora/contracts

Content shapes shared by the API, the admin and the site. No React, no I/O.

| Import | Contents |
|---|---|
| `@hexapixora/contracts/blocks/<id>` | One block: zod schema, props type, definition (`defineBlock`) |
| `@hexapixora/contracts/blocks/registry` | All blocks, categories, default anchor ids |
| `@hexapixora/contracts/blocks/legacy-types` | Stored block type (`HeroSection`) → block id (`hero`) |
| `@hexapixora/contracts/layout/header`, `/layout/footer` | Header and footer schemas |
| `@hexapixora/contracts/permissions` | Grantable admin sections |
| `@hexapixora/contracts/countries` | Country list for forms |

Import each block by its own path so a page only bundles the schemas it uses.
Source is TypeScript consumed directly (Next transpiles it; the API imports
types only), so keep to erasable syntax: no `enum`, no `namespace`.
