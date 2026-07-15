import React from "react";
import { apiUrl } from "@/lib/api-url";
import { siteUrl, absoluteMediaUrl } from "@/lib/site-url";
import { JsonLd } from "@/components/seo/json-ld";
import { CookieConsent } from "@/components/public/cookie-consent";
import ChatWidget from "@/components/public/chat-widget";

async function getSettings(): Promise<any | null> {
  try {
    const res = await fetch(apiUrl("/settings"), { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch {
    // ignore — JSON-LD is best-effort
  }
  return null;
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const siteName = settings?.siteName || "HexaPixora";

  // Organization + WebSite structured data, emitted on every public page so
  // search engines can build a knowledge-panel / sitelinks entry.
  const sameAs = settings?.socialLinks
    ? Object.values(settings.socialLinks).filter(
        (v): v is string => typeof v === "string" && v.length > 0,
      )
    : [];

  const organization: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl("/"),
    ...(settings?.tagline ? { description: settings.tagline } : {}),
    ...(settings?.logoUrl ? { logo: absoluteMediaUrl(settings.logoUrl) } : {}),
    ...(settings?.businessEmail ? { email: settings.businessEmail } : {}),
    ...(settings?.businessPhone
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            telephone: settings.businessPhone,
            contactType: "customer service",
          },
        }
      : {}),
    ...(settings?.address
      ? { address: { "@type": "PostalAddress", streetAddress: settings.address } }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl("/"),
  };

  return (
    <div className="public-layout-wrapper">
      <JsonLd data={organization} />
      <JsonLd data={website} />
      <CookieConsent
        googleAnalyticsId={settings?.googleAnalyticsId}
        gtmId={settings?.gtmId}
        metaPixelId={settings?.metaPixelId}
      />
      {children}
      <ChatWidget />
    </div>
  );
}
