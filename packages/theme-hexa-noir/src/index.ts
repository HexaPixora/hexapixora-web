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

export type NoirColor = keyof typeof colors;
