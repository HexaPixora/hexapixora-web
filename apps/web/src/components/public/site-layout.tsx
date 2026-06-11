import React from "react";
import PublicHeader from "@/components/public/header";
import PublicFooter from "@/components/public/footer";

async function getLayoutData() {
  try {
    const [settingsRes, headerRes, footerRes, navsRes] = await Promise.all([
      fetch('http://localhost:3001/api/settings', { next: { tags: ['layouts'] } }).catch(() => null),
      fetch('http://localhost:3001/api/layouts/header', { next: { tags: ['layouts'] } }).catch(() => null),
      fetch('http://localhost:3001/api/layouts/footer', { next: { tags: ['layouts'] } }).catch(() => null),
      fetch('http://localhost:3001/api/layouts/navigations', { next: { tags: ['layouts'] } }).catch(() => null),
    ]);

    return {
      settings: settingsRes?.ok ? (await settingsRes.json())?.data : null,
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
          navigations={data.navigations} 
        />
      )}
    </div>
  );
}
