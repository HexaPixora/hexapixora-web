# @hexapixora/theme-hexapixora

The HexaPixora public theme. A theme renders content; it does not load it:
apps fetch data and pass it in as props. User-triggered actions (form
submits) go through `@hexapixora/sdk/browser`.

| Import | Contents |
|---|---|
| `@hexapixora/theme-hexapixora/block-renderer` | Renders a page's `sections` array, mapping stored block types to components |
| `@hexapixora/theme-hexapixora/blocks/<id>` | One block component; ids match `@hexapixora/contracts/blocks/<id>` |
| `@hexapixora/theme-hexapixora/components/<name>` | Shared public components (insight card, contact form, liquid glass…) |
| `@hexapixora/theme-hexapixora/layout/site-shell` | `SiteShell`: header + main + footer from layout data passed in by the app |
| `@hexapixora/theme-hexapixora/layout/header`, `/layout/footer` | Header and footer |
| `@hexapixora/theme-hexapixora/icons/social-icons` | Social icon registry (also used by the footer editor) |
| `@hexapixora/theme-hexapixora/lib/<name>` | Theme helpers (`media-alt`, `analytics`) |
| `@hexapixora/theme-hexapixora/styles/theme.css` | Tokens, base styles and component CSS; declares its own Tailwind `@source` |

Use it from an app's `globals.css` after Tailwind:
`@import "@hexapixora/theme-hexapixora/styles/theme.css";` and list the
package in `transpilePackages`.

A new theme for another site implements the same block ids and exports the
same paths (`block-renderer`, `layout/site-shell`, `styles/theme.css`).
