import { env } from '../config/env';

/**
 * True when a request carries the shared preview token, granting it read access
 * to unpublished/scheduled content. The token is server-to-server only (the web
 * app's Draft Mode forwards it on RSC fetches) and never exposed to browsers.
 * Disabled entirely when PREVIEW_TOKEN is unset.
 */
export function hasPreviewAccess(token?: string): boolean {
  return Boolean(env.previewToken) && token === env.previewToken;
}
