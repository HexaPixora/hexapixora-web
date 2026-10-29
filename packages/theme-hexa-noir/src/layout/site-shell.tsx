import type { ReactNode } from "react";
import { Footer } from "./footer";
import { Header } from "./header";
import type { SiteShellData } from "./nav-types";

/**
 * Page frame: skip link, fixed header, main content and footer. The header
 * floats over the page, so main is pushed below it unless the page opens
 * with a full-screen hero (`headerOverlay`).
 */
export function SiteShell({
  children,
  data,
  showHeader = true,
  showFooter = true,
  headerOverlay = false,
  newsletter,
}: {
  children: ReactNode;
  data: SiteShellData;
  showHeader?: boolean;
  showFooter?: boolean;
  headerOverlay?: boolean;
  /** The app's newsletter form, shown in the footer when enabled. */
  newsletter?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="mono sr-only z-50 bg-signal px-4 py-3 text-on-signal focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      {showHeader ? <Header data={data} /> : null}
      <main
        id="main"
        tabIndex={-1}
        className={`flex flex-1 flex-col outline-none ${showHeader && !headerOverlay ? "pt-[calc(var(--header-h)+env(safe-area-inset-top))]" : ""}`}
      >
        {children}
      </main>
      {showFooter ? <Footer data={data} newsletter={newsletter} /> : null}
    </div>
  );
}
