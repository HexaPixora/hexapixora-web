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

/** Thrown when the API can't be reached or answers 5xx (as opposed to a 404). */
export class ApiUnavailableError extends Error {
  constructor(detail: string) {
    super(`CMS API unavailable: ${detail}`);
    this.name = "ApiUnavailableError";
  }
}

/**
 * Read a resource that a page depends on. Like readJson, but tells "missing"
 * apart from "API down": a 404 (or other 4xx) returns null so the page can call
 * notFound(), while a failed fetch (null) or 5xx throws. Throwing renders the
 * error boundary and is never cached by ISR, so an outage can't leave a cached
 * 404 behind.
 */
export async function readResource(res: Response | null | undefined): Promise<any> {
  if (!res) throw new ApiUnavailableError("request failed");
  if (res.status >= 500) throw new ApiUnavailableError(`HTTP ${res.status}`);
  return readJson(res);
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
