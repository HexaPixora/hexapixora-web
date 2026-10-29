/**
 * Link safety for CMS-provided URLs. Editors type links into the admin, so a
 * value like `javascript:alert(1)` must never reach an `href`.
 */

const SAFE_SCHEMES = ["http:", "https:", "mailto:", "tel:"];

/** Returns the URL when it is a relative path, an anchor or uses a safe scheme; otherwise null. */
export function safeHref(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const url = value.trim();
  if (!url) return null;
  // Relative paths and in-page anchors. `//host` is protocol-relative (external), handled below.
  if ((url.startsWith("/") && !url.startsWith("//")) || url.startsWith("#") || url.startsWith("?")) return url;
  // Control characters and whitespace can hide a scheme from naive checks.
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\s]/.test(url)) return null;
  try {
    const parsed = new URL(url.startsWith("//") ? `https:${url}` : url);
    return SAFE_SCHEMES.includes(parsed.protocol) ? url : null;
  } catch {
    return null;
  }
}

/** True for links that leave the site (absolute http(s) or protocol-relative). */
export function isExternalHref(href: string): boolean {
  return /^(https?:)?\/\//i.test(href);
}
