import type { MetadataRoute } from "next";
import { colors } from "@hexapixora/theme-hexa-noir";

// Web App Manifest. When the site is added to the home screen it launches in
// "standalone" mode — no browser chrome, edge-to-edge. Combined with
// viewport-fit=cover + the apple status-bar meta (black-translucent), content
// fills the whole screen and flows under the status bar. Switch display to
// "fullscreen" to also hide the status bar entirely (fully immersive).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HexaPixora",
    short_name: "HexaPixora",
    description: "Modern digital agency — where pixels meet logic.",
    start_url: "/",
    display: "standalone",
    background_color: colors.black,
    theme_color: colors.black,
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
  };
}
