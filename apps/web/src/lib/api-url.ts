/**
 * Base URL for the NestJS API, used by Server Components / server-side fetches.
 *
 * Set API_URL (server-only) in production, e.g. https://api.hexapixora.com/api.
 * Falls back to the public var and finally to local dev. Note the trailing
 * "/api" prefix is part of the base — callers append "/blogs", "/pages", etc.
 */
export const API_BASE_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001/api";

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
