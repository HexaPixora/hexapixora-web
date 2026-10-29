# @hexapixora/theme-hexa-noir

Hexa Noir, the HexaPixora public theme: black, bone and one ember light
source, wide display type and film grain. Like every theme it renders content
and never fetches it.

| Import | Contents |
|---|---|
| `@hexapixora/theme-hexa-noir` | Tokens for code that can't read CSS (`colors`, `easings`, `durations`), e.g. canvas and GSAP |
| `@hexapixora/theme-hexa-noir/block-renderer` | `BlockRenderer`: renders a page's `sections`, mapping stored block types (legacy keys and new ids) to components |
| `@hexapixora/theme-hexa-noir/blocks/<id>` | One block component, e.g. `blocks/hero` → `src/blocks/hero/hero-block.tsx` |
| `@hexapixora/theme-hexa-noir/components/<name>` | Shared public components (contact form, insight card, newsletter form…) |
| `@hexapixora/theme-hexa-noir/icons/social-icons` | Social icon registry (also used by the admin's footer editor) |
| `@hexapixora/theme-hexa-noir/lib/<name>` | Helpers: `maintenance-page`, `media-alt`, `analytics` |
| `@hexapixora/theme-hexa-noir/block-map` | `NOIR_BLOCKS`: stored type → component for the cinematic blocks (each its own chunk) |
| `@hexapixora/theme-hexa-noir/layout/site-shell` | `SiteShell`: skip link, fixed hide-on-scroll header with a full-screen menu (native `<dialog>`), main and footer; the app passes layout data and its newsletter form |
| `@hexapixora/theme-hexa-noir/layout/nav-types` | `SiteShellData`, `EMPTY_SITE_SHELL_DATA` and navigation types |
| `@hexapixora/theme-hexa-noir/styles/theme.css` | Tailwind `@theme` tokens, base styles, grain overlay and the `mono` / `wide` / `gutter-x` utilities; declares its own `@source` |

## Tokens

- Colours by role (so theme packs can repaint them): `page`, `page-raised`, `panel`, `copy`, `copy-dim`, `signal`, `on-signal`, `on-signal-dim`, `brand`, `line`, and for paper dossiers `paper`, `paper-ink`, `paper-dim`, `paper-rule`, `redact` (`bg-page`, `text-signal`, `border-line`…).
- Type: `font-display` (Unbounded), `font-body` / `font-sans` (Manrope), `font-mono` (JetBrains Mono); sizes `text-label`, `text-title`, `text-statement`, `text-display-md|lg|xl`.
- Spacing: `py-section`, `mb-chapter`, `px-gutter`. Radius: square by default, `rounded-pill` for buttons.
- Motion: `ease-expo-out`, `ease-power3-out`, `ease-cut`; `--duration-fast|base|slow`.

## Use

In the app's `globals.css`, after Tailwind:
`@import "@hexapixora/theme-hexa-noir/styles/theme.css";`, list the package in
`transpilePackages`, and load the fonts with `next/font` as the CSS variables
`--font-unbounded`, `--font-manrope` and `--font-jetbrains-mono` on `<body>`.

Until Phase 3.4 ends, the older blocks still use the shadcn surface tokens, so
the site imports `@hexapixora/ui/styles/tokens.css` before this theme, which
maps those tokens onto its palette. Their leftover component CSS lives in
`styles/legacy.css` and shrinks as blocks are restyled.

## Blocks

`film-hero`, `statement`, `crew`, `pillars`, `case-files`, `lab`,
`process-steps`, `faq-list`, `closing-cta`. Definitions (zod schema, defaults,
admin fields) live in `@hexapixora/contracts/blocks/<id>`; the UI lives in
`src/blocks/<id>/<id>-block.tsx`. They are server components; only the motion
leaves from `@hexapixora/motion` run on the client.

Rules every block follows:
- Config is read with `parseBlockConfig`, so bad data falls back to defaults.
- CMS links go through `SafeLink` (safe schemes only; `rel` on external links).
- One `<h1>` (the hero); each section's chapter row is its `<h2>`.
- Redacted case-file values are never rendered, not just hidden.
- The FAQ emits `FAQPage` JSON-LD with `<` escaped.

## Theme-pack hooks

Blocks get their look only from the tokens above. Every block root carries
`data-block="<id>"` and, where it has one, `data-variant`; key parts carry
`data-part` (`film-tile`, `file`, `file-rows`, `redact`, `lab-card`, `nodes`,
`step`, `faq-item`, `chapter`, `service-list`). A theme pack restyles a block by
repainting tokens or targeting these attributes, without code.
