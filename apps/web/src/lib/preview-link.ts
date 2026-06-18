import { apiClient } from "./api-client";
import { siteUrl } from "./site-url";

/**
 * Build a Draft Mode preview URL for the live site. Fetches the shared preview
 * token from the authenticated API, then points at the web app's `/api/preview`
 * route which enables Draft Mode and redirects to `path` (e.g. "/blog/my-post").
 * Throws if preview isn't configured (PREVIEW_TOKEN unset on the API).
 */
export async function getDraftPreviewUrl(path: string): Promise<string> {
  const res = await apiClient.get("/preview/token");
  const token = res.data?.token;
  if (!token) throw new Error("Preview is not configured.");
  const qs = new URLSearchParams({ secret: token, path });
  return `${siteUrl("/api/preview")}?${qs.toString()}`;
}
