/**
 * Centralized, validated environment access.
 *
 * Required secrets must be present in production — the process refuses to
 * start otherwise, so we never silently fall back to a publicly-known signing
 * key. In non-production a clearly-labeled dev default is used and a warning is
 * logged.
 */

const isProd = process.env.NODE_ENV === 'production';

function required(name: string, devDefault: string): string {
  const value = process.env[name];
  if (value && value.length > 0) return value;

  if (isProd) {
    throw new Error(
      `Missing required environment variable "${name}". Refusing to start in production.`,
    );
  }

  // eslint-disable-next-line no-console
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

export const env = {
  isProd,
  port: parseInt(process.env.PORT ?? '3001', 10),
  jwtAccessSecret: required('JWT_ACCESS_SECRET', 'dev_only_access_secret'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET', 'dev_only_refresh_secret'),
  corsOrigins: list('CORS_ORIGINS', [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ]),

  // Transactional email (Resend). All optional — when the API key is absent the
  // MailService no-ops with a warning, so lead capture still works without it.
  mail: {
    // https://resend.com/api-keys
    resendApiKey: process.env.RESEND_API_KEY ?? '',
    // Must be a verified Resend sender, e.g. "HexaPixora <hello@hexapixora.com>".
    // Defaults to Resend's shared test sender so dev works out of the box.
    from: process.env.MAIL_FROM ?? 'HexaPixora <onboarding@resend.dev>',
    // Internal address that receives new-lead notifications. Falls back to the
    // site's businessEmail (from settings) when unset — see LeadsService.
    notifyTo: process.env.LEADS_NOTIFY_TO ?? '',
  },

  // Support-chat AI. Any OpenAI-compatible endpoint works — default targets
  // Groq's free tier: create a key at https://console.groq.com/keys and set
  // AI_API_KEY. Alternatives, just by overriding AI_BASE_URL/AI_MODEL: Google
  // Gemini (https://generativelanguage.googleapis.com/v1beta/openai) or a local
  // Ollama (http://localhost:11434/v1) for zero-cost self-hosting. When no key
  // is set the bot stays silent and conversations route to the team.
  ai: {
    baseUrl: (process.env.AI_BASE_URL ?? 'https://api.groq.com/openai/v1').replace(
      /\/+$/,
      '',
    ),
    apiKey: process.env.AI_API_KEY ?? '',
    // Used only when the admin leaves ChatbotConfig.aiModel blank.
    fallbackModel: process.env.AI_MODEL ?? 'llama-3.3-70b-versatile',
  },
};
