/** @type {import('next').NextConfig} */

// Origin of the NestJS API that /api/* is proxied to (same as the site), so
// auth cookies are set on the admin's own domain with no CORS.
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

const nextConfig = {
  // Workspace packages ship TypeScript source; Next compiles them like app code.
  transpilePackages: ['@hexapixora/contracts', '@hexapixora/motion', '@hexapixora/sdk', '@hexapixora/theme-hexa-noir', '@hexapixora/ui'],
  // The public site's address is not a secret: it appears in every "View page"
  // link the admin renders in the browser.
  env: {
    SITE_URL: (process.env.SITE_URL || 'http://localhost:3000').replace(/\/+$/, ''),
  },
  allowedDevOrigins: ['*.trycloudflare.com'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${apiProxyOrigin()}/api/:path*` }];
  },
  async redirects() {
    return [{ source: '/', destination: '/admin', permanent: false }];
  },
};

export default nextConfig;
