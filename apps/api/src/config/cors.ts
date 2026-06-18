import { env } from './env';

// localhost / loopback / RFC-1918 private LAN ranges (with optional port).
const PRIVATE_LAN =
  /^https?:\/\/(localhost|127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/;

type CorsCallback = (err: Error | null, allow?: boolean) => void;

/**
 * Shared CORS origin check for both the HTTP server and the socket.io gateway.
 * Allows the configured origins always; in development it additionally accepts
 * any localhost/LAN origin so the site works when opened from a phone on the
 * same network (e.g. http://192.168.x.x:3000) without hardcoding the machine's
 * IP. Production stays strict (CORS_ORIGINS only).
 */
export function corsOrigin(origin: string | undefined, callback: CorsCallback) {
  // Same-origin / non-browser requests (curl, server-to-server) send no Origin.
  if (!origin) return callback(null, true);
  if (env.corsOrigins.includes(origin)) return callback(null, true);
  if (!env.isProd && PRIVATE_LAN.test(origin)) return callback(null, true);
  return callback(new Error(`Origin ${origin} not allowed by CORS`), false);
}
