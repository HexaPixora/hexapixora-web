/** @type {import('next').NextConfig} */

// Origin of the NestJS API that /api/* is proxied to. Derive it from the
// configured API URL (stripping any /api suffix) so production deployments
// don't fall back to localhost. Override with API_PROXY_ORIGIN if needed.
function apiProxyOrigin() {
  const explicit = process.env.API_PROXY_ORIGIN;
  if (explicit) return explicit.replace(/\/+$/, '');

  const base = process.env.API_URL;
  if (base) {
    try {
      return new URL(base).origin;
    } catch {
      // fall through to default
    }
  }
  return 'http://localhost:3001';
}

// Origin of the admin app (e.g. https://admin.hexapixora.com). Unset in local
// dev, where the admin runs separately on its own port.
function adminRedirects() {
  const admin = (process.env.ADMIN_URL || '').replace(/\/+$/, '');
  if (!admin) return [];
  return ['/admin', '/admin/:path*', '/login', '/forgot-password', '/reset-password', '/verify-email'].map(
    (source) => ({ source, destination: `${admin}${source}`, permanent: false }),
  );
}

const nextConfig = {
  // Workspace packages ship TypeScript source; Next compiles them like app code.
  transpilePackages: ['@hexapixora/contracts', '@hexapixora/motion', '@hexapixora/sdk', '@hexapixora/theme-hexa-noir', '@hexapixora/theme-hexapixora', '@hexapixora/ui'],
  // Allow the dev server to be reached through a Cloudflare quick tunnel
  // (https://*.trycloudflare.com) so phones/other devices can load it without
  // Next blocking the cross-origin dev request.
  allowedDevOrigins: ['*.trycloudflare.com'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.render.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
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
      // The admin moved to its own app/domain; keep old bookmarks and emailed
      // reset/verify links working.
      ...adminRedirects(),
      { source: '/blog', destination: '/insights', permanent: true },
      { source: '/blog/feed.xml', destination: '/insights/feed.xml', permanent: true },
      { source: '/category/:slug', destination: '/insights/:slug', permanent: true },
      { source: '/blog/:slug', destination: '/insights/:slug', permanent: true },
      { source: '/insights/:cat/:slug', destination: '/insights/:slug', permanent: true },
    ];
  },
};

export default nextConfig;
