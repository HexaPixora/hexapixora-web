import type { Metadata, Viewport } from "next";
import { Inter, Fraunces, Sacramento } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
// Block previews (the Leader module) use these; loaded only when referenced.
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const sacramento = Sacramento({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-signature",
  preload: false,
  display: "swap",
});

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // Dark-only, like the site, so previews and the editor share one look.
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} ${fraunces.variable} ${sacramento.variable} min-h-screen bg-background font-sans antialiased`}>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        {children}
      </body>
    </html>
  );
}
