/**
 * Public base URL of the live site, for canonical, OG and sitemap URLs.
 * Server-only. SITE_URL overrides it, e.g. https://hexapixora.com.
 */
function resolveSiteUrl(): string {
  // Explicit config always wins (set this in prod, e.g. https://hexapixora.com).
  const explicit = process.env.SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  // On Vercel, fall back to the real deployment domain so OG/canonical URLs are
  // correct even if SITE_URL was never set, preferring the stable prod domain.
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProd) return `https://${vercelProd.replace(/\/+$/, "")}`;
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;
  // In the browser the admin and the public site share one origin, so the
  // current origin is always a better answer than localhost.
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

export function siteUrl(path = ""): string {
  const clean = path.replace(/^\/+/, "");
  return clean ? `${SITE_URL}/${clean}` : SITE_URL;
}

/**
 * Resolve a media `url` to an absolute, shareable address.
 *
 * Stored media URLs are app-relative API paths like "/api/media/file/x.png".
 * They're served through the web app's `/api` rewrite (which proxies to the
 * backend), so the correct host is the public site origin — not the admin
 * origin or the API origin directly. Already-absolute URLs pass through.
 */
export function absoluteMediaUrl(url: string): string {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return siteUrl(url);
}
