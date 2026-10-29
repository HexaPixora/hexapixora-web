# @hexapixora/theme-hexa-noir

Hexa Noir, the HexaPixora public theme: black, bone and one ember light
source, wide display type and film grain. Like every theme it renders content
and never fetches it.

| Import | Contents |
|---|---|
| `@hexapixora/theme-hexa-noir` | Tokens for code that can't read CSS (`colors`, `easings`, `durations`), e.g. canvas and GSAP |
| `@hexapixora/theme-hexa-noir/styles/theme.css` | Tailwind `@theme` tokens, base styles, grain overlay and the `mono` / `wide` / `gutter-x` utilities; declares its own `@source` |

## Tokens

- Colours: `ink`, `ink-raised`, `bone`, `dim`, `ember`, `brand`, `line` (`bg-ink`, `text-ember`, `border-line`…).
- Type: `font-display` (Unbounded), `font-body` / `font-sans` (Manrope), `font-mono` (JetBrains Mono); sizes `text-label`, `text-title`, `text-statement`, `text-display-md|lg|xl`.
- Spacing: `py-section`, `mb-chapter`, `px-gutter`. Radius: square by default, `rounded-pill` for buttons.
- Motion: `ease-expo-out`, `ease-power3-out`, `ease-cut`; `--duration-fast|base|slow`.

## Use

In the app's `globals.css`, after Tailwind:
`@import "@hexapixora/theme-hexa-noir/styles/theme.css";`, list the package in
`transpilePackages`, and load the fonts with `next/font` as the CSS variables
`--font-unbounded`, `--font-manrope` and `--font-jetbrains-mono` on `<body>`.

Until Phase 3.4 the site also imports `@hexapixora/theme-hexapixora`; this
theme is imported after it and maps the old surface tokens onto its palette.
