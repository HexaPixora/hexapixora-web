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

// Public site URL baked into the client bundle. Admin "View" links run in the
// browser, where only NEXT_PUBLIC_* vars exist — so if NEXT_PUBLIC_SITE_URL
// isn't set, derive it from Vercel's production domain at build time instead
// of letting the browser fall back to localhost.
function publicSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProd) return `https://${vercelProd}`;
  return '';
}

const nextConfig = {
  // Workspace packages ship TypeScript source; Next compiles them like app code.
  transpilePackages: ['@hexapixora/contracts', '@hexapixora/motion', '@hexapixora/sdk', '@hexapixora/ui'],
  env: {
    NEXT_PUBLIC_SITE_URL: publicSiteUrl(),
  },
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
      { source: '/blog', destination: '/insights', permanent: true },
      { source: '/blog/feed.xml', destination: '/insights/feed.xml', permanent: true },
      { source: '/category/:slug', destination: '/insights/:slug', permanent: true },
      { source: '/blog/:slug', destination: '/insights/:slug', permanent: true },
      { source: '/insights/:cat/:slug', destination: '/insights/:slug', permanent: true },
    ];
  },
};

export default nextConfig;
