import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getAdminTheme } from "@/lib/theme/admin-theme";
import { EDITOR_FONT_CLASSES } from "@/lib/theme/theme-fonts";

// The browser chrome takes the theme's page colour and scheme.
export async function generateViewport(): Promise<Viewport> {
  const theme = await getAdminTheme();
  return { colorScheme: theme.dark ? "dark" : "light" };
}

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // The admin wears the active theme pack (plans/admin-redesign).
  const theme = await getAdminTheme();
  return (
    <html
      lang="en"
      className={theme.dark ? "dark" : undefined}
      style={{ colorScheme: theme.dark ? "dark" : "light" }}
      suppressHydrationWarning
    >
      <head>
        {/* Theme roles: built-in tokens, then the active pack's overrides. Checked to hold no markup. */}
        <style id="admin-theme" dangerouslySetInnerHTML={{ __html: theme.css }} />
      </head>
      <body className={`${EDITOR_FONT_CLASSES.join(" ")} min-h-screen bg-background font-sans antialiased`}>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        {children}
      </body>
    </html>
  );
}
