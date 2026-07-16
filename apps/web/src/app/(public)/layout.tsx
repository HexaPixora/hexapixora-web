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

// Social profile URLs live in the footer CMS config (managed at
// /admin/layouts/footer), not in settings — so pull them from there to power
// the Organization `sameAs`, which tells Google which profiles are officially
// ours (strengthens the brand entity / knowledge panel).
async function getFooterSocials(): Promise<string[]> {
  let selfHost = "hexapixora.com";
  try {
    selfHost = new URL(siteUrl("/")).hostname.toLowerCase();
  } catch {
    /* keep default */
  }
  try {
    const res = await fetch(apiUrl("/layouts/footer"), { cache: "no-store" });
    if (!res.ok) return [];
    const body = await res.json();
    const socials = body?.data?.socials;
    if (!Array.isArray(socials)) return [];
    const out: string[] = [];
    for (const s of socials) {
      let url = typeof s?.url === "string" ? s.url.trim() : "";
      if (!url || /^(mailto:|tel:)/i.test(url)) continue;
      // Normalize scheme-less entries like "instagram.com/hexapixora".
      if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
      let host = "";
      try {
        host = new URL(url).hostname.toLowerCase();
      } catch {
        continue;
      }
      // sameAs is for *external* profiles — drop the site's own domain.
      if (host === selfHost || host.endsWith(`.${selfHost}`)) continue;
      out.push(url);
    }
    return out;
  } catch {
    return [];
  }
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, footerSocials] = await Promise.all([
    getSettings(),
    getFooterSocials(),
  ]);
  const siteName = settings?.siteName || "HexaPixora";

  // Organization + WebSite structured data, emitted on every public page so
  // search engines can build a knowledge-panel / sitelinks entry. `sameAs`
  // comes from the footer's social links (deduped), plus any settings.socialLinks.
  const settingsSocials = settings?.socialLinks
    ? Object.values(settings.socialLinks).filter(
        (v): v is string => typeof v === "string" && v.length > 0,
      )
    : [];
  const sameAs = Array.from(new Set([...footerSocials, ...settingsSocials]));

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
