// Request headers for the /api proxy, so the API rate-limits per visitor
// rather than per proxy. Used by the site's and admin's proxy.ts.

/**
 * The visitor's IP as the host reports it. Vercel sets both headers itself and
 * replaces any value the visitor sends, so they can be trusted there.
 */
function visitorIp(headers: Headers): string {
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
}

/**
 * Copies the incoming headers and sets X-Client-IP and X-Proxy-Secret. Values
 * a visitor sent for those two headers are always dropped, and without
 * API_PROXY_SECRET nothing is forwarded (the API then ignores X-Client-IP).
 */
export function clientIpHeaders(incoming: Headers): Headers {
  const headers = new Headers(incoming);
  headers.delete("x-client-ip");
  headers.delete("x-proxy-secret");

  const secret = process.env.API_PROXY_SECRET;
  const ip = visitorIp(incoming);
  if (secret && ip) {
    headers.set("x-client-ip", ip);
    headers.set("x-proxy-secret", secret);
  }
  return headers;
}
