/**
 * Public site the admin manages, for "View page" / "Preview" links. The admin
 * runs on its own domain, so this comes from SITE_URL (never the admin's own
 * origin), e.g. https://hexapixora.com. next.config.js builds it into the
 * admin's browser code, since these links render there.
 */
export const SITE_URL = (process.env.SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

export function siteUrl(path = ""): string {
  const clean = path.replace(/^\/+/, "");
  return clean ? `${SITE_URL}/${clean}` : SITE_URL;
}

/**
 * Absolute, shareable address for a media `url`. Stored URLs are absolute
 * Supabase URLs or app-relative API paths ("/api/media/file/x.png"), which the
 * public site serves through its /api rewrite.
 */
export function absoluteMediaUrl(url: string): string {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return siteUrl(url);
}
