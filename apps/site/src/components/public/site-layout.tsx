import React from "react";
import { SiteShell } from "@hexapixora/theme-hexa-noir/layout/site-shell";
import { EMPTY_SITE_SHELL_DATA, type SiteShellData } from "@hexapixora/theme-hexa-noir/layout/nav-types";
import { NewsletterForm } from "@hexapixora/theme-hexa-noir/components/newsletter-form";
import { getFooterConfig, getHeaderConfig, getNavigations, getSettings } from "@/lib/site-data";

// The app loads layout data; the theme's SiteShell renders it.
async function getLayoutData(): Promise<SiteShellData> {
  const [settings, headerConfig, footerConfig, navigations] = await Promise.all([
    getSettings(),
    getHeaderConfig(),
    getFooterConfig(),
    getNavigations(),
  ]);
  return { settings, headerConfig, footerConfig, navigations };
}

interface SiteLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  /** Let the first section sit behind the fixed header (no empty band above
   *  a full-screen hero). Used by module-built pages. */
  headerOverlay?: boolean;
}

export async function SiteLayout({
  children,
  showHeader = true,
  showFooter = true,
  headerOverlay = false
}: SiteLayoutProps) {
  const data = (showHeader || showFooter) ? await getLayoutData() : EMPTY_SITE_SHELL_DATA;

  return (
    <SiteShell
      data={data}
      showHeader={showHeader}
      showFooter={showFooter}
      headerOverlay={headerOverlay}
      newsletter={<NewsletterForm />}
    >
      {children}
    </SiteShell>
  );
}
