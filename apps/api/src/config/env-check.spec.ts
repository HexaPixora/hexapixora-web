import { checkEnv, formatEnvProblems } from './env-check';

const KEY_A = 'a'.repeat(48);
const KEY_B = 'b'.repeat(48);

// A complete, valid production setup; each test changes one thing.
const PROD = {
  DATABASE_URL: 'postgresql://user:pass@db.example.com:5432/site',
  JWT_ACCESS_SECRET: KEY_A,
  JWT_REFRESH_SECRET: KEY_B,
  APP_URL: 'https://example.com',
  ADMIN_URL: 'https://admin.example.com',
  CORS_ORIGINS: 'https://example.com,https://admin.example.com',
  SUPABASE_URL: 'https://ref.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role',
  RESEND_API_KEY: 're_key',
  MAIL_FROM: 'Site <hello@example.com>',
  API_PROXY_SECRET: 'proxy-secret',
  TURNSTILE_SECRET_KEY: 'turnstile',
};

const prod = (changes: Record<string, string | undefined> = {}) =>
  checkEnv({ ...PROD, ...changes }, true);
const mentions = (list: string[], text: string) =>
  list.some((line) => line.includes(text));

describe('checkEnv', () => {
  it('accepts a complete production setup', () => {
    expect(prod()).toEqual({ errors: [], warnings: [] });
  });

  it('requires both signing keys in production', () => {
    const { errors } = prod({
      JWT_ACCESS_SECRET: undefined,
      JWT_REFRESH_SECRET: '',
    });
    expect(mentions(errors, 'JWT_ACCESS_SECRET is not set')).toBe(true);
    expect(mentions(errors, 'JWT_REFRESH_SECRET is not set')).toBe(true);
  });

  it('refuses short or identical signing keys', () => {
    expect(
      mentions(prod({ JWT_ACCESS_SECRET: 'short' }).errors, 'too short'),
    ).toBe(true);
    expect(
      mentions(prod({ JWT_REFRESH_SECRET: KEY_A }).errors, 'must be different'),
    ).toBe(true);
  });

  it('requires a postgres database URL', () => {
    expect(
      mentions(
        prod({ DATABASE_URL: undefined }).errors,
        'DATABASE_URL is not set',
      ),
    ).toBe(true);
    expect(
      mentions(prod({ DATABASE_URL: 'mysql://x' }).errors, 'postgresql://'),
    ).toBe(true);
  });

  it('requires public https addresses in production', () => {
    expect(
      mentions(prod({ APP_URL: undefined }).errors, 'APP_URL is not set'),
    ).toBe(true);
    expect(
      mentions(
        prod({ APP_URL: 'http://example.com' }).errors,
        'APP_URL must be a public https',
      ),
    ).toBe(true);
    expect(
      mentions(
        prod({ ADMIN_URL: 'https://localhost:3002' }).errors,
        'ADMIN_URL must be',
      ),
    ).toBe(true);
    expect(
      mentions(
        prod({ ADMIN_URL: 'not a url' }).errors,
        'ADMIN_URL is not a valid',
      ),
    ).toBe(true);
  });

  it('accepts SITE_URL in place of APP_URL', () => {
    expect(
      prod({ APP_URL: undefined, SITE_URL: 'https://example.com' }).errors,
    ).toEqual([]);
  });

  it('checks every CORS origin', () => {
    expect(
      mentions(prod({ CORS_ORIGINS: '' }).errors, 'CORS_ORIGINS is not set'),
    ).toBe(true);
    expect(
      mentions(
        prod({ CORS_ORIGINS: 'https://example.com/' }).errors,
        'not an origin',
      ),
    ).toBe(true);
    expect(
      mentions(
        prod({ CORS_ORIGINS: 'https://example.com,http://localhost:3000' })
          .errors,
        'public https origins',
      ),
    ).toBe(true);
  });

  it('refuses half-configured features', () => {
    expect(
      mentions(
        prod({ SUPABASE_SERVICE_ROLE_KEY: '' }).errors,
        'Media storage needs both',
      ),
    ).toBe(true);
    expect(
      mentions(
        prod({ VAPID_PUBLIC_KEY: 'pub' }).errors,
        'Push notifications needs both',
      ),
    ).toBe(true);
    expect(
      mentions(
        prod({ REVALIDATE_SECRET: 'secret' }).errors,
        'Instant site refresh needs both',
      ),
    ).toBe(true);
  });

  it('requires a mailto: or https: push contact', () => {
    const bad = 'VAPID_SUBJECT must be a mailto: or https: address.';
    expect(prod({ VAPID_SUBJECT: 'admin@example.com' }).errors).toContain(bad);
    expect(prod({ VAPID_SUBJECT: 'mailto:admin@example.com' }).errors).toEqual(
      [],
    );
    expect(prod({ VAPID_SUBJECT: 'https://admin.example.com' }).errors).toEqual(
      [],
    );
  });

  it('refuses non-numeric numbers', () => {
    expect(
      mentions(
        prod({ TRUST_PROXY_HOPS: 'one' }).errors,
        'TRUST_PROXY_HOPS must be a whole number',
      ),
    ).toBe(true);
  });

  it('warns about optional features that are off', () => {
    const { errors, warnings } = prod({
      SUPABASE_URL: undefined,
      SUPABASE_SERVICE_ROLE_KEY: undefined,
      RESEND_API_KEY: undefined,
      API_PROXY_SECRET: undefined,
      TURNSTILE_SECRET_KEY: undefined,
    });
    expect(errors).toEqual([]);
    expect(warnings).toHaveLength(4);
  });

  it('is lenient in development', () => {
    const { errors } = checkEnv(
      {
        CORS_ORIGINS: 'http://localhost:3000',
        APP_URL: 'http://localhost:3000',
      },
      false,
    );
    expect(errors).toEqual([]);
  });

  it('formats errors before warnings', () => {
    const text = formatEnvProblems({ errors: ['E'], warnings: ['W'] });
    expect(text).toBe(
      'Settings that must be fixed:\n  - E\nSettings that are off:\n  - W',
    );
  });
});
