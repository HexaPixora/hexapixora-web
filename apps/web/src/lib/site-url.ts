/**
 * Public base URL of the live site (the public-facing web app).
 * Used for "View page" / "Preview" links from the admin. Set
 * NEXT_PUBLIC_SITE_URL in production, e.g. https://hexapixora.com
 */
function resolveSiteUrl(): string {
  // Explicit config always wins (set this in prod, e.g. https://hexapixora.com).
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  // On Vercel, fall back to the real deployment domain so OG/canonical URLs are
  // correct even if NEXT_PUBLIC_SITE_URL was never set. These are server-only
  // (available where metadata is generated), preferring the stable prod domain.
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProd) return `https://${vercelProd.replace(/\/+$/, "")}`;
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;
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
