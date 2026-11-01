import {
  JetBrains_Mono,
  Manrope,
  Sacramento,
  Unbounded,
} from "next/font/google";

// The built-in Hexa Noir faces (as in apps/site/src/app/layout.tsx). The admin
// UI uses them through the theme's font roles (body, display, mono) unless the
// active pack brings its own; block previews use them too. The signature face
// is only used by one block, so it isn't preloaded.
const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
  display: "swap",
});
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});
const sacramento = Sacramento({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-signature",
  preload: false,
  display: "swap",
});

/** Classes that set the --font-* variables the theme's font stacks read. */
export const EDITOR_FONT_CLASSES = [
  unbounded,
  manrope,
  jetbrainsMono,
  sacramento,
].map((font) => font.variable);
