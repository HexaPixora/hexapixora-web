/**
 * Startup check for every API setting. Pure (takes the variables, returns
 * problems), so it is unit-tested and the same rules can be run against a
 * host's settings before a deploy.
 *
 * Errors stop a production start: the API would be insecure or broken (no
 * signing keys, weak keys, a database it can't reach, half-configured
 * features). Warnings are features that quietly do nothing until set.
 */

export type EnvVars = Record<string, string | undefined>;
export type EnvProblems = { errors: string[]; warnings: string[] };

/** Signing keys shorter than this are guessable; `openssl rand -base64 48` gives 64 characters. */
export const MIN_SECRET_LENGTH = 32;

const LOCAL_HOST = /^(localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0)$/;

function value(vars: EnvVars, name: string): string {
  return vars[name]?.trim() ?? '';
}

function parseUrl(raw: string): URL | null {
  try {
    const url = new URL(raw);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}

export function checkEnv(vars: EnvVars, isProd: boolean): EnvProblems {
  const errors: string[] = [];
  const warnings: string[] = [];
  const has = (name: string) => value(vars, name) !== '';

  // A public address the API puts into emails or calls: valid, and in
  // production https and not a local machine.
  const checkPublicUrl = (
    name: string,
    { required }: { required: boolean },
  ) => {
    const raw = value(vars, name);
    if (!raw) {
      if (required && isProd)
        errors.push(`${name} is not set. Set it to the public https address.`);
      return;
    }
    const url = parseUrl(raw);
    if (!url) {
      errors.push(`${name} is not a valid http(s) URL.`);
    } else if (
      isProd &&
      (url.protocol !== 'https:' || LOCAL_HOST.test(url.hostname))
    ) {
      errors.push(`${name} must be a public https address in production.`);
    }
  };

  // Settings that only work together.
  const pair = (a: string, b: string, feature: string) => {
    if (has(a) !== has(b))
      errors.push(`${feature} needs both ${a} and ${b}; only one is set.`);
  };

  // ── Database ──────────────────────────────────────────────────────────────
  if (!has('DATABASE_URL')) {
    (isProd ? errors : warnings).push(
      'DATABASE_URL is not set. The API cannot reach its database.',
    );
  } else if (!/^postgres(ql)?:\/\//.test(value(vars, 'DATABASE_URL'))) {
    errors.push('DATABASE_URL must be a postgresql:// connection string.');
  }

  // ── Sign-in keys ──────────────────────────────────────────────────────────
  const access = value(vars, 'JWT_ACCESS_SECRET');
  const refresh = value(vars, 'JWT_REFRESH_SECRET');
  for (const [name, secret] of [
    ['JWT_ACCESS_SECRET', access],
    ['JWT_REFRESH_SECRET', refresh],
  ] as const) {
    if (!secret) {
      if (isProd)
        errors.push(
          `${name} is not set. Generate one with: openssl rand -base64 48`,
        );
    } else if (isProd && secret.length < MIN_SECRET_LENGTH) {
      errors.push(
        `${name} is too short (at least ${MIN_SECRET_LENGTH} characters). Generate one with: openssl rand -base64 48`,
      );
    }
  }
  if (access && access === refresh) {
    errors.push('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different.');
  }

  // ── Addresses ─────────────────────────────────────────────────────────────
  if (!has('APP_URL') && !has('SITE_URL') && isProd) {
    errors.push(
      'APP_URL is not set. Set it to the public https address of the site.',
    );
  }
  checkPublicUrl(has('APP_URL') ? 'APP_URL' : 'SITE_URL', { required: false });
  checkPublicUrl('ADMIN_URL', { required: false });

  const origins = value(vars, 'CORS_ORIGINS')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  if (isProd && origins.length === 0) {
    errors.push(
      'CORS_ORIGINS is not set. List the site and admin origins, comma-separated.',
    );
  }
  for (const origin of origins) {
    const url = parseUrl(origin);
    if (!url || url.origin !== origin) {
      errors.push(
        `CORS_ORIGINS has "${origin}", which is not an origin (scheme://host[:port], no path or trailing slash).`,
      );
    } else if (
      isProd &&
      (url.protocol !== 'https:' || LOCAL_HOST.test(url.hostname))
    ) {
      errors.push(
        `CORS_ORIGINS has "${origin}"; production allows only public https origins.`,
      );
    }
  }

  // ── Numbers ───────────────────────────────────────────────────────────────
  for (const name of ['PORT', 'TRUST_PROXY_HOPS']) {
    if (has(name) && !/^\d+$/.test(value(vars, name)))
      errors.push(`${name} must be a whole number.`);
  }

  // ── Features that need two settings ───────────────────────────────────────
  pair('SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'Media storage');
  pair('VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY', 'Push notifications');
  pair('SITE_REVALIDATE_URL', 'REVALIDATE_SECRET', 'Instant site refresh');
  if (has('SUPABASE_URL')) checkPublicUrl('SUPABASE_URL', { required: false });
  if (has('SITE_REVALIDATE_URL'))
    checkPublicUrl('SITE_REVALIDATE_URL', { required: false });

  // ── Optional features that are off (production only) ──────────────────────
  if (isProd) {
    if (!has('SUPABASE_URL') && !has('SUPABASE_SERVICE_ROLE_KEY')) {
      warnings.push(
        'Media storage is not set (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY): uploads go to local disk and are lost on redeploy.',
      );
    }
    if (!has('RESEND_API_KEY')) {
      warnings.push(
        'RESEND_API_KEY is not set: no emails (password reset, invites, lead alerts) are sent.',
      );
    } else if (!has('MAIL_FROM')) {
      warnings.push(
        "MAIL_FROM is not set: emails go from Resend's shared test sender.",
      );
    }
    if (!has('API_PROXY_SECRET')) {
      warnings.push(
        'API_PROXY_SECRET is not set: rate limits count all visitors behind the site and admin as one.',
      );
    }
    if (!has('TURNSTILE_SECRET_KEY')) {
      warnings.push(
        'TURNSTILE_SECRET_KEY is not set: the contact form has no spam check.',
      );
    }
  }

  return { errors, warnings };
}

/** One readable block for the startup log. */
export function formatEnvProblems({ errors, warnings }: EnvProblems): string {
  const lines: string[] = [];
  if (errors.length)
    lines.push(
      'Settings that must be fixed:',
      ...errors.map((e) => `  - ${e}`),
    );
  if (warnings.length)
    lines.push('Settings that are off:', ...warnings.map((w) => `  - ${w}`));
  return lines.join('\n');
}
