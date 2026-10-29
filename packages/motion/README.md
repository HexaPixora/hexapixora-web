# @hexapixora/motion

The animation layer themes build on.

| Import | Contents |
|---|---|
| `@hexapixora/motion/gsap` | `gsap` + `ScrollTrigger`, loaded with the page (used by the older blocks) |
| `@hexapixora/motion/load-gsap` | `loadGsap()`: GSAP + ScrollTrigger as a lazy chunk, loaded once; `whenIdle()`, `prefersReducedMotion()` |
| `@hexapixora/motion/hooks/use-gsap-effect` | `useGsapEffect(setup)`: runs a GSAP setup on an element when the page is idle, skipped under reduced motion, reverted on unmount |
| `@hexapixora/motion/reveal` | `<Reveal>`: fade/rise a section in on first view (styles: `[data-reveal]` in the app CSS) |
| `@hexapixora/motion/clip-reveal` | `<ClipReveal>`: clip-path wipe plus a rise on first view |
| `@hexapixora/motion/word-light` | `<WordLight text>`: words light up as the statement scrolls (scrubbed) |
| `@hexapixora/motion/count-up` | `<CountUp to suffix>`: counts up on first view |
| `@hexapixora/motion/draw-line` | `<DrawLine axis>`: a rule drawn while its parent scrolls (scrubbed) |
| `@hexapixora/motion/redact-bar` | `<RedactBar width label>`: a redaction bar that slides in; screen readers hear the label |
| `@hexapixora/motion/hero-title` | `<HeroTitle lines>`: lines rise on load with CSS only (safe for the LCP headline) |
| `@hexapixora/motion/drift` | `<Drift x y>`: content drifts while its section scrolls away |
| `@hexapixora/motion/hide-on-scroll-header` | `<HideOnScrollHeader>`: sets `data-solid` / `data-away` for the theme to style |
| `@hexapixora/motion/film-canvas` | `<FilmCanvas look seed>`: generated light-streak footage, half resolution, 30 fps, only while visible |
| `@hexapixora/motion/styles/motion.css` | CSS for `HeroTitle`; import once in the app's `globals.css` |

Every primitive renders its final state on the server, so content is
complete without JavaScript and with reduced motion. Animation only starts
after the page is idle, and elements already on screen at that moment are
not hidden again.

Rules (see the design motion guide): animate transform/opacity/clip-path only,
always provide a `prefers-reduced-motion` branch, and keep flashes within
WCAG 2.3.1. Colours never live here; themes pass them in (e.g. `filmLooks`
from `@hexapixora/theme-hexa-noir`).
