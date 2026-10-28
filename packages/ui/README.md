# @hexapixora/ui

The admin UI kit: shadcn components (owned source on the `radix-ui` package)
plus admin primitives. Public themes do not use it.

| Import | Contents |
|---|---|
| `@hexapixora/ui/<component>` | e.g. `button`, `dialog`, `select`, `data-table`, `status-pill` |
| `@hexapixora/ui/admin` | Admin primitives barrel (PageHeader, TableCard, Field, SectionCard…) |
| `@hexapixora/ui/cn` | `cn()` class merger |
| `@hexapixora/ui/status-colors` | `LEAD_STATUS`, `CONTENT_STATUS` pill styles |

Add a shadcn component from this folder with a pinned CLI, e.g.
`npx shadcn@4.10.0 add tooltip`, then fix its imports to the relative paths
used here. Apps that render these components need
`@source "<path>/packages/ui/src";` in their Tailwind CSS.
