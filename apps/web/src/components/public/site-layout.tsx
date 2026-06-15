import React from "react";
import PublicHeader from "@/components/public/header";
import PublicFooter from "@/components/public/footer";
import { apiUrl } from "@/lib/api-url";

async function getLayoutData() {
  try {
    const [settingsRes, headerRes, footerRes, navsRes] = await Promise.all([
      fetch(apiUrl('/settings'), { next: { tags: ['layouts'] } }).catch(() => null),
      fetch(apiUrl('/layouts/header'), { next: { tags: ['layouts'] } }).catch(() => null),
      fetch(apiUrl('/layouts/footer'), { next: { tags: ['layouts'] } }).catch(() => null),
      fetch(apiUrl('/layouts/navigations'), { next: { tags: ['layouts'] } }).catch(() => null),
    ]);

    return {
      // /settings returns the SiteSetting row directly (a flat object), unlike
      // the layout endpoints which nest their config under a `data` column.
      settings: settingsRes?.ok ? await settingsRes.json() : null,
      headerConfig: headerRes?.ok ? (await headerRes.json())?.data : null,
      footerConfig: footerRes?.ok ? (await footerRes.json())?.data : null,
      navigations: navsRes?.ok ? (await navsRes.json())?.data : []
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
