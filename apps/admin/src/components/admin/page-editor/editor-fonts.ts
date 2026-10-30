import {
  JetBrains_Mono,
  Manrope,
  Sacramento,
  Unbounded,
} from "next/font/google";

// The site's Hexa Noir faces (apps/site/src/app/layout.tsx), for the page
// editor's preview frame. Nothing is preloaded: the admin's own pages never use
// them, and the browser fetches a face only once the preview shows text in it.
const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
  display: "swap",
  preload: false,
});
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  preload: false,
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  preload: false,
});
const sacramento = Sacramento({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-signature",
  display: "swap",
  preload: false,
});

/** Classes that set the --font-* variables the theme's font stacks read. */
export const EDITOR_FONT_CLASSES = [
  unbounded,
  manrope,
  jetbrainsMono,
  sacramento,
].map((font) => font.variable);
