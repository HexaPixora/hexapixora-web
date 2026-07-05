import { apiUrl } from "./api-url";

/**
 * Safely read a JSON body from a fetch Response. Returns null instead of
 * throwing when the response is missing, not-ok, or has an empty/invalid body
 * (e.g. the API returns a 200 with no body for an unknown layout key). This
 * prevents one bad sub-fetch from crashing an entire page render.
 */
export async function readJson(res: Response | null | undefined): Promise<any> {
  if (!res || !res.ok) return null;
  try {
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

/**
 * Server-side fetch to the CMS API. Thin wrapper over `fetch` that resolves the
 * API base URL; preserves any `next` cache tags the caller passes.
 */
export async function cmsFetch(
  path: string,
  init: RequestInit & { next?: { tags?: string[]; revalidate?: number } } = {},
): Promise<Response> {
  return fetch(apiUrl(path), init);
}
