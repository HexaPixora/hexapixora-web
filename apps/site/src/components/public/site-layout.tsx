import React from "react";
import { SiteShell } from "@hexapixora/theme-hexa-noir/layout/site-shell";
import { EMPTY_SITE_SHELL_DATA, type SiteShellData } from "@hexapixora/theme-hexa-noir/layout/nav-types";
import { NewsletterForm } from "@hexapixora/theme-hexapixora/components/newsletter-form";
import { apiUrl } from "@hexapixora/sdk/server";
import { readJson } from "@hexapixora/sdk/server";

// The app loads layout data; the theme's SiteShell renders it.
async function getLayoutData(): Promise<SiteShellData> {
  try {
    // Revalidate periodically (120s) so pages serve instantly from edge cache
    // without stalling visitors during cold starts.
    const [settingsRes, headerRes, footerRes, navsRes] = await Promise.all([
      fetch(apiUrl('/settings'), { next: { revalidate: 120 } }).catch(() => null),
      fetch(apiUrl('/layouts/header'), { next: { revalidate: 120 } }).catch(() => null),
      fetch(apiUrl('/layouts/footer'), { next: { revalidate: 120 } }).catch(() => null),
      fetch(apiUrl('/layouts/navigations'), { next: { revalidate: 120 } }).catch(() => null),
    ]);

    // readJson never throws on an empty/invalid body, so one missing layout
    // record (empty 200) can't blank out the whole header/footer/nav.
    return {
      // /settings returns the SiteSetting row directly (a flat object), unlike
      // the layout endpoints which nest their config under a `data` column.
      settings: await readJson(settingsRes),
      headerConfig: (await readJson(headerRes))?.data ?? null,
      footerConfig: (await readJson(footerRes))?.data ?? null,
      navigations: (await readJson(navsRes))?.data ?? []
    };
  } catch (err) {
    console.error("Layout fetch error:", err);
    return EMPTY_SITE_SHELL_DATA;
  }
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
