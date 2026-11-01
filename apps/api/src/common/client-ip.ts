import { timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';
import { env } from '../config/env';

type IpRequest = {
  ip?: string;
  headers: Record<string, string | string[] | undefined>;
};

function header(req: IpRequest, name: string): string {
  const value = req.headers[name];
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? '';
}

function secretMatches(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * The visitor's IP address, for rate limits.
 *
 * Browser calls reach the API through the site's or admin's /api proxy, so the
 * connection address is the proxy's and every visitor would share one limit.
 * The proxies forward the visitor's IP in X-Client-IP together with the shared
 * secret; anyone else can set that header too, so it counts only when the
 * secret matches. Otherwise the connection address is used.
 */
export function clientIp(req: IpRequest, secret = env.proxySecret): string {
  if (secret && secretMatches(header(req, 'x-proxy-secret'), secret)) {
    const forwarded = header(req, 'x-client-ip');
    if (isIP(forwarded)) return forwarded;
  }
  return req.ip ?? '';
}
