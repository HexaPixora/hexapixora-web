import type { ThemeTokens } from "./schema";

/**
 * The built-in Hexa Noir tokens as theme pack data, mirroring
 * packages/theme-hexa-noir/src/styles/theme.css (a test keeps them in step).
 * The editor starts from these when customising the built-in theme. Fonts are
 * left empty: the built-in faces are loaded by the site itself.
 */
export const HEXA_NOIR_TOKENS: ThemeTokens = {
  colors: {
    page: "#07080c",
    "page-raised": "#12131a",
    panel: "#0e0f16",
    copy: "#f1ece2",
    "copy-dim": "#9a958c",
    signal: "#ff5a1f",
    "on-signal": "#07080c",
    "on-signal-dim": "#2a1206",
    brand: "#1b2587",
    line: "rgb(241 236 226 / 0.14)",
    "on-media": "#f1ece2",
    paper: "#e9e3d6",
    "paper-ink": "#15161c",
    "paper-dim": "#5d5a54",
    "paper-rule": "rgb(21 22 28 / 0.2)",
    redact: "#0b0b0e",
  },
  fonts: {},
  type: {
    label: "0.75rem",
    title: "clamp(1.1rem, 1.7vw, 1.45rem)",
    statement: "clamp(1.8rem, 4.2vw, 3.8rem)",
    promise: "clamp(1.4rem, 3vw, 2.4rem)",
    question: "clamp(1.05rem, 2vw, 1.4rem)",
    "display-md": "clamp(2.4rem, 5vw, 4.2rem)",
    "display-hero": "clamp(2.4rem, 6vw, 5.6rem)",
    "display-pillar": "clamp(3rem, 8vw, 7.4rem)",
    "display-lg": "clamp(3rem, 9.4vw, 9.6rem)",
    "display-xl": "clamp(3rem, 11vw, 10rem)",
  },
  space: { section: "140px", chapter: "56px", page: "1440px" },
  radius: { pill: "999px" },
  motion: {
    "expo-out": "cubic-bezier(0.16, 1, 0.3, 1)",
    "power3-out": "cubic-bezier(0.215, 0.61, 0.355, 1)",
    cut: "cubic-bezier(0.7, 0, 0.2, 1)",
  },
};
