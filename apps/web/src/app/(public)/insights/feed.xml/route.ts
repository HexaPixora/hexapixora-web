import { apiUrl } from "@/lib/api-url";
import { siteUrl } from "@/lib/site-url";

// Rebuild the feed at most hourly.
export const revalidate = 3600;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function getSiteName(): Promise<string> {
  try {
    const res = await fetch(apiUrl("/settings"), { next: { revalidate } });
    if (res.ok) {
      const settings = await res.json();
      if (settings?.siteName) return settings.siteName;
    }
  } catch {
    // fall through to default
  }
  return "HexaPixora";
}

async function getInsights(): Promise<any[]> {
  try {
    const res = await fetch(apiUrl("/blogs?published=true&limit=50"), {
      next: { revalidate },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data ?? [];
  } catch {
    return [];
  }
}

export async function GET() {
  const [siteName, posts] = await Promise.all([getSiteName(), getInsights()]);

  const items = posts
    .filter((p) => p?.slug)
    .map((p) => {
      const link = siteUrl(`/insights/${p.slug}`);
      const date = p.publishDate || p.updatedAt || p.createdAt;
      const pubDate = date ? new Date(date).toUTCString() : undefined;
      return [
        "    <item>",
        `      <title>${escapeXml(p.title ?? "Untitled")}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        p.excerpt
          ? `      <description>${escapeXml(p.excerpt)}</description>`
          : "",
        p.category
          ? `      <category>${escapeXml(p.category)}</category>`
          : "",
        pubDate ? `      <pubDate>${pubDate}</pubDate>` : "",
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteName)} Insights</title>
    <link>${escapeXml(siteUrl("/insights"))}</link>
    <description>Latest insights on design, development, and digital marketing from ${escapeXml(siteName)}.</description>
    <language>en</language>
    <atom:link href="${escapeXml(siteUrl("/insights/feed.xml"))}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
