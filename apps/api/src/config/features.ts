/**
 * Optional features a site can switch off with FEATURES (comma-separated
 * list of the ones to keep). A feature that is off loads no module, so it has
 * no routes at all. Pages, blog, media, users and settings are always on.
 *
 * FEATURES unset (or empty) keeps everything on, so existing sites need no
 * change; FEATURES=none switches every optional feature off.
 */
export const FEATURE_KEYS = [
  'leads',
  'newsletter',
  'push',
  'automation',
  'themes',
  'search',
] as const;

export type Feature = (typeof FEATURE_KEYS)[number];
export type Features = Record<Feature, boolean>;

const isFeature = (key: string): key is Feature =>
  (FEATURE_KEYS as readonly string[]).includes(key);

export function parseFeatures(raw: string | undefined): {
  features: Features;
  unknown: string[];
} {
  const list = (raw ?? '')
    .split(',')
    .map((key) => key.trim().toLowerCase())
    .filter(Boolean);
  const allOn = list.length === 0;
  const off = list.length === 1 && list[0] === 'none';

  const features = Object.fromEntries(
    FEATURE_KEYS.map((key) => [key, allOn || (!off && list.includes(key))]),
  ) as Features;
  const unknown = off ? [] : list.filter((key) => !isFeature(key));
  return { features, unknown };
}
