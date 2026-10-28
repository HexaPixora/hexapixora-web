# @hexapixora/theme-hexapixora

The HexaPixora public theme. A theme renders content; it does not load it:
apps fetch data and pass it in as props. User-triggered actions (form
submits) go through `@hexapixora/sdk/browser`.

| Import | Contents |
|---|---|
| `@hexapixora/theme-hexapixora/block-renderer` | Renders a page's `sections` array, mapping stored block types to components |
| `@hexapixora/theme-hexapixora/blocks/<id>` | One block component; ids match `@hexapixora/contracts/blocks/<id>` |
| `@hexapixora/theme-hexapixora/components/<name>` | Shared public components (insight card, contact form, liquid glass…) |
| `@hexapixora/theme-hexapixora/lib/<name>` | Theme helpers (`media-alt`, `analytics`) |

A new theme for another site implements the same block ids. Apps that render
it need `@source "<path>/packages/theme-<name>/src";` in their Tailwind CSS
and the package in `transpilePackages`.
