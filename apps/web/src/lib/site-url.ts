/**
 * Public base URL of the live site (the public-facing web app).
 * Used for "View page" / "Preview" links from the admin. Set
 * NEXT_PUBLIC_SITE_URL in production, e.g. https://hexapixora.com
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

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
