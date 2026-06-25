import { draftMode } from "next/headers";
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

/** Whether the current request is rendering in Next.js Draft Mode (admin preview). */
export async function isPreview(): Promise<boolean> {
  try {
    const dm = await draftMode();
    return dm.isEnabled;
  } catch {
    // draftMode() throws outside a request scope (e.g. at build time).
    return false;
  }
}

/**
 * Server-side fetch to the CMS API that transparently switches to preview when
 * Draft Mode is on: it forwards the shared `x-preview-token` (server-only) so
 * the API returns unpublished/scheduled content, and bypasses the cache so the
 * editor always sees the latest draft. Outside preview it behaves like a normal
 * `fetch`, preserving any `next` cache tags the caller passes.
 */
export async function cmsFetch(
  path: string,
  init: RequestInit & { next?: { tags?: string[]; revalidate?: number } } = {},
): Promise<Response> {
  const preview = await isPreview();
  if (!preview) return fetch(apiUrl(path), init);

  const headers = new Headers(init.headers);
  const token = process.env.PREVIEW_TOKEN;
  if (token) headers.set("x-preview-token", token);

  const { next: _next, ...rest } = init;
  return fetch(apiUrl(path), { ...rest, headers, cache: "no-store" });
}
