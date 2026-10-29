/**
 * Hexa Noir tokens for code that can't read CSS variables (canvas drawing,
 * GSAP timelines). Keep these in sync with `styles/theme.css`, which is the
 * source for everything styled with CSS.
 */

export const colors = {
  black: "#07080c",
  bone: "#f1ece2",
  dim: "#9a958c",
  ember: "#ff5a1f",
  blue: "#1b2587",
  line: "rgba(241, 236, 226, 0.14)",
} as const;

/** GSAP ease names. CSS equivalents are `--ease-expo-out` and `--ease-power3-out`. */
export const easings = {
  expoOut: "expo.out",
  power3Out: "power3.out",
  power2Out: "power2.out",
  inOut: "power4.inOut",
} as const;

/** Durations in seconds (GSAP units). */
export const durations = {
  fast: 0.4,
  base: 0.8,
  slow: 1.2,
  drawn: 1.8,
} as const;

/**
 * Looks for the generated "footage" canvas (`FilmCanvas` in @hexapixora/motion):
 * a light colour, the haze it drifts through and the streak angle.
 */
export const filmLooks = {
  ember: { light: colors.ember, shade: "#3a0c02", angle: -0.5 },
  flare: { light: "#ff8a3d", shade: "#1a0703", angle: 0.4 },
  rust: { light: "#c2410c", shade: colors.black, angle: -0.2 },
  brand: { light: colors.blue, shade: colors.black, angle: 0.6 },
  cobalt: { light: "#2f4bd8", shade: colors.black, angle: -0.6 },
  dusk: { light: colors.ember, shade: colors.black, angle: 0.3 },
} as const;

export type NoirColor = keyof typeof colors;
export type NoirFilmLook = keyof typeof filmLooks;
