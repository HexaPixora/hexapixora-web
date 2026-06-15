import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { apiUrl } from "@/lib/api-url";
import { SITE_URL } from "@/lib/site-url";

const inter = Inter({ subsets: ["latin"] });

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
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
