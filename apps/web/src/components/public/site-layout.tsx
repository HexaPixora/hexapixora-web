import React from "react";
import PublicHeader from "@/components/public/header";
import PublicFooter from "@/components/public/footer";

async function getMenu() {
  try {
    const res = await fetch('http://localhost:3001/api/layouts/mega-menu', { cache: 'no-store' });
    const json = await res.json();
    return json?.data?.items || [];
  } catch (err) {
    return [];
  }
}

async function getSettings() {
  try {
    const res = await fetch('http://localhost:3001/api/settings', { cache: 'no-store' });
    return await res.json();
  } catch (err) {
    return null;
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
  // If neither header nor footer is shown, we can skip fetching data
  const shouldFetchData = showHeader || showFooter;
  
  const menuItems = shouldFetchData ? await getMenu() : [];
  const settings = shouldFetchData ? await getSettings() : null;

  return (
    <div className="flex min-h-screen flex-col">
      {showHeader && <PublicHeader menuItems={menuItems} settings={settings} />}
      <main className="flex-1 flex flex-col">{children}</main>
      {showFooter && <PublicFooter settings={settings} />}
    </div>
  );
}
