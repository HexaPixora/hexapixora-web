# @hexapixora/motion

The animation layer themes build on.

| Import | Contents |
|---|---|
| `@hexapixora/motion/gsap` | `gsap` + `ScrollTrigger`, plugins registered once |
| `@hexapixora/motion/reveal` | `<Reveal>`: fade/rise a section in on first view (styles: `[data-reveal]` in the app CSS) |

Rules (see the design motion guide): animate transform/opacity/clip-path only,
always provide a `prefers-reduced-motion` branch, and keep flashes within
WCAG 2.3.1. Lazy-loading GSAP comes with the performance phase.
