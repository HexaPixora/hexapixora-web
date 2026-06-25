import React from "react";
import PublicHeader from "@/components/public/header";
import PublicFooter from "@/components/public/footer";
import { apiUrl } from "@/lib/api-url";
import { readJson } from "@/lib/cms-fetch";

async function getLayoutData() {
  try {
    // no-store so header/footer/menu/settings edits reflect immediately on the
    // public site (this layout renders on every page).
    const [settingsRes, headerRes, footerRes, navsRes] = await Promise.all([
      fetch(apiUrl('/settings'), { cache: "no-store" }).catch(() => null),
      fetch(apiUrl('/layouts/header'), { cache: "no-store" }).catch(() => null),
      fetch(apiUrl('/layouts/footer'), { cache: "no-store" }).catch(() => null),
      fetch(apiUrl('/layouts/navigations'), { cache: "no-store" }).catch(() => null),
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
    return { settings: null, headerConfig: null, footerConfig: null, navigations: [] };
  }
}

interface SiteLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

export default async function SiteLayout({
  children,
  showHeader = true,
  showFooter = true
}: SiteLayoutProps) {
  const data = (showHeader || showFooter) ? await getLayoutData() : { settings: null, headerConfig: null, footerConfig: null, navigations: [] };
  
  console.log("SiteLayout fetched navigations:", data.navigations?.length);


  return (
    <div className="flex min-h-screen flex-col">
      {showHeader && (
        <PublicHeader 
          settings={data.settings} 
          config={data.headerConfig} 
          navigations={data.navigations} 
        />
      )}
      <main className="flex-1 flex flex-col">{children}</main>
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
