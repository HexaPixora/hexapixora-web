import type React from "react";
import PublicHeader from "./header";
import PublicFooter from "./footer";

/** Layout data the app loads from the API and hands to the theme. */
export type SiteShellData = {
  settings: any;
  headerConfig: any;
  footerConfig: any;
  navigations: any[];
};

export const EMPTY_SITE_SHELL_DATA: SiteShellData = {
  settings: null,
  headerConfig: null,
  footerConfig: null,
  navigations: [],
};

interface SiteShellProps {
  children: React.ReactNode;
  data: SiteShellData;
  showHeader?: boolean;
  showFooter?: boolean;
  /** Pull the content up so the first section sits BEHIND the transparent
   *  header (no empty band above the hero). Used by module-built pages. */
  headerOverlay?: boolean;
}

export function SiteShell({
  children,
  data,
  showHeader = true,
  showFooter = true,
  headerOverlay = false,
}: SiteShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {showHeader && (
        <PublicHeader 
          settings={data.settings} 
          config={data.headerConfig} 
          navigations={data.navigations} 
        />
      )}
      <main className={`flex-1 flex flex-col ${headerOverlay && showHeader ? "-mt-16" : ""}`}>{children}</main>
      {showFooter && (
        <PublicFooter 
          settings={data.settings} 
          config={data.footerConfig} 
          headerConfig={data.headerConfig}
          navigations={data.navigations} 
        />
      )}
    </div>
  );
}
