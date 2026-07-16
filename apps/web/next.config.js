/** @type {import('next').NextConfig} */

// Origin of the NestJS API that /api/* is proxied to. Derive it from the
// configured API URL (stripping any /api suffix) so production deployments
// don't fall back to localhost. Override with API_PROXY_ORIGIN if needed.
function apiProxyOrigin() {
  const explicit = process.env.API_PROXY_ORIGIN;
  if (explicit) return explicit.replace(/\/+$/, '');

  const base = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (base) {
    try {
      return new URL(base).origin;
    } catch {
      // fall through to default
    }
  }
  return 'http://localhost:3001';
}

const nextConfig = {
  // Allow the dev server to be reached through a Cloudflare quick tunnel
  // (https://*.trycloudflare.com) so phones/other devices can load it without
  // Next blocking the cross-origin dev request.
  allowedDevOrigins: ['*.trycloudflare.com'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiProxyOrigin()}/api/:path*`,
      },
    ];
  },
  // The blog lives at /insights. Everything is FLAT now: /insights/:slug is a
  // post OR a category (resolved at request time). Old nested post URLs
  // (/insights/:cat/:slug) permanently redirect to the flat post URL — safe
  // because no legitimate two-segment /insights route exists anymore.
  async redirects() {
    return [
      { source: '/blog', destination: '/insights', permanent: true },
      { source: '/blog/feed.xml', destination: '/insights/feed.xml', permanent: true },
      { source: '/category/:slug', destination: '/insights/:slug', permanent: true },
      { source: '/blog/:slug', destination: '/insights/:slug', permanent: true },
      { source: '/insights/:cat/:slug', destination: '/insights/:slug', permanent: true },
    ];
  },
};

export default nextConfig;
