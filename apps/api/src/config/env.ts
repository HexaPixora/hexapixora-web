/**
 * Centralized, validated environment access.
 *
 * Every setting is checked at startup (./env-check). In production any error
 * stops the process with the full list, so the API never runs with a missing
 * or publicly-known signing key or a half-configured feature. In development
 * problems are logged and clearly-labeled dev defaults are used.
 */
import { checkEnv, formatEnvProblems } from './env-check';
import { parseFeatures } from './features';

const isProd = process.env.NODE_ENV === 'production';

const problems = checkEnv(process.env, isProd);
if (isProd && problems.errors.length > 0) {
  throw new Error(`The API cannot start.
${formatEnvProblems(problems)}`);
}
const report = formatEnvProblems(
  isProd
    ? problems
    : { errors: [], warnings: [...problems.errors, ...problems.warnings] },
);
if (report)
  console.warn(`[env]
${report}`);

// Production is guaranteed a value by the check above.
function withDevDefault(name: string, devDefault: string): string {
  const value = process.env[name];
  if (value && value.length > 0) return value;
  console.warn(
    `[env] ${name} is not set — using an insecure development default. Set it before deploying.`,
  );
  return devDefault;
}

function list(name: string, devDefault: string[]): string[] {
  const value = process.env[name];
  if (!value) return devDefault;
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const appUrl = (
  process.env.APP_URL ||
  process.env.SITE_URL ||
  'http://localhost:3000'
).replace(/\/+$/, '');

export const env = {
  isProd,
  // The site's name until Settings has one: the name a new site starts with
  // and the fallback in emails. Settings → Site name wins once saved.
  siteName: process.env.SITE_NAME?.trim() || 'Website',
  // Optional features this site runs (./features); all on when FEATURES is unset.
  features: parseFeatures(process.env.FEATURES).features,
  port: parseInt(process.env.PORT ?? '3001', 10),
  // Public origin of the site — used for links to public pages in outgoing
  // emails (unsubscribe, blog posts). Set APP_URL in prod.
  appUrl,
  // Origin of the admin app, which hosts the account pages (password reset,
  // email verification). Falls back to the site while both share one origin.
  adminUrl: (process.env.ADMIN_URL || appUrl).replace(/\/+$/, ''),
  jwtAccessSecret: withDevDefault(
    'JWT_ACCESS_SECRET',
    'dev_only_access_secret',
  ),
  jwtRefreshSecret: withDevDefault(
    'JWT_REFRESH_SECRET',
    'dev_only_refresh_secret',
  ),
  corsOrigins: list('CORS_ORIGINS', [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ]),

  // Transactional email (Resend). All optional — when the API key is absent the
  // MailService no-ops with a warning, so lead capture still works without it.
  mail: {
    // https://resend.com/api-keys
    resendApiKey: process.env.RESEND_API_KEY ?? '',
    // Must be a verified Resend sender, e.g. "Studio <hello@example.com>".
    // Defaults to Resend's shared test sender so dev works out of the box.
    from:
      process.env.MAIL_FROM ||
      `${process.env.SITE_NAME?.trim() || 'Website'} <onboarding@resend.dev>`,
    // Internal address that receives new-lead notifications. Falls back to the
    // site's businessEmail (from settings) when unset — see LeadsService.
    notifyTo: process.env.LEADS_NOTIFY_TO ?? '',
  },

  // Web Push (VAPID). Generate with `npx web-push generate-vapid-keys`. When the
  // keys are absent, PushService no-ops (the in-app bell still works).
  push: {
    publicKey: process.env.VAPID_PUBLIC_KEY ?? '',
    privateKey: process.env.VAPID_PRIVATE_KEY ?? '',
    // Contact for push services: a mailto: or https: address. Defaults to the
    // admin's address (https in production, checked at startup).
    subject:
      process.env.VAPID_SUBJECT ||
      (process.env.ADMIN_URL || appUrl).replace(/\/+$/, ''),
  },

  // Cloudflare Turnstile for the contact form. Verification is skipped when unset.
  turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY ?? '',

  // Supabase Storage for media. When the URL or key is unset, uploads fall back
  // to the local ./uploads disk (fine for dev, ephemeral on container hosts).
  storage: {
    supabaseUrl: process.env.SUPABASE_URL ?? '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    bucket: process.env.SUPABASE_STORAGE_BUCKET || 'media',
  },

  // Shared secret for the scheduled automation routines (X-Automation-Key header).
  // When unset, every /api/automation route is disabled.
  automationApiKey: process.env.AUTOMATION_API_KEY ?? '',

  // Real visitor addresses for rate limits. The site and admin proxies send
  // the visitor's IP in X-Client-IP with this shared secret in X-Proxy-Secret;
  // the API trusts X-Client-IP only when the secret matches. When unset, the
  // header is ignored and the connection address is used.
  proxySecret: process.env.API_PROXY_SECRET ?? '',
  // Load balancers in front of the API (Express "trust proxy" hop count), so
  // the connection address is the caller's, not the balancer's. 0 = none.
  trustProxyHops: parseInt(process.env.TRUST_PROXY_HOPS ?? '0', 10) || 0,

  // On-demand revalidation of the site's cached pages after content writes.
  // SITE_REVALIDATE_URL is the site's /hooks/revalidate route; when it or the
  // secret is unset, pages refresh only on their normal revalidate interval.
  revalidate: {
    url: process.env.SITE_REVALIDATE_URL ?? '',
    secret: process.env.REVALIDATE_SECRET ?? '',
  },
};
