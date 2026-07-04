import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { apiUrl } from "@/lib/api-url";
import { SITE_URL } from "@/lib/site-url";

const inter = Inter({ subsets: ["latin"] });

// The app is dark-mode only — no light theme, no switching. Declaring the dark
// color scheme here makes native UI (form controls, scrollbars) and the mobile
// browser chrome render dark on every device.
export const viewport: Viewport = {
  colorScheme: "dark",
  // Matches the site's dark --background (oklch(0.145 0 0)) so the mobile
  // status-bar area blends seamlessly with the page.
  themeColor: "#0a0a0a",
  // Paint under the notch / home indicator so we control those pixels with the
  // page background + glass, instead of a browser-drawn bar.
  viewportFit: "cover",
};

// Pull branding (favicon, site name) from site settings. Tagged 'layouts' so it
// revalidates when settings are saved in the admin. The favicon URL is an
// app-relative /api/media/file/... path, served via the web app's /api rewrite.
export async function generateMetadata(): Promise<Metadata> {
  let settings: any = null;
  try {
    const res = await fetch(apiUrl("/settings"), { next: { tags: ["layouts"] } });
    if (res.ok) settings = await res.json();
  } catch {
    // Fall back to defaults if settings can't be loaded.
  }

  const siteName = settings?.siteName || "HexaPixora";

  return {
    // Resolves relative OG/canonical URLs to absolute ones across all pages.
    metadataBase: new URL(SITE_URL),
    title: settings?.tagline
      ? `${siteName} | ${settings.tagline}`
      : `${siteName} | Modern Digital Agency`,
    description: settings?.tagline || "A premium marketing and development agency.",
    // Custom favicon from branding, falling back to the bundled default.
    icons: { icon: settings?.faviconUrl || "/favicon.ico" },
    // Installed (home-screen) mode: launch standalone/edge-to-edge with the
    // status bar translucent so page content flows underneath it — the safe-area
    // insets in the header/footer keep everything clear of the notch.
    appleWebApp: {
      capable: true,
      title: siteName,
      statusBarStyle: "black-translucent",
    },
    // Next only emits the modern `mobile-web-app-capable`; older iOS needs the
    // legacy prefixed tag for `black-translucent` (content-under-status-bar) to apply.
    other: {
      "apple-mobile-web-app-capable": "yes",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // `dark` is hardcoded (not toggled at runtime) so the dark theme is applied
    // during SSR / first paint — no white flash on any device, JS or not.
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
