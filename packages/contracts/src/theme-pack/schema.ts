import { z } from "zod";

// The theme.json of a theme pack (plans/phase-3b). Every value is checked
// against a narrow character set, so a token can never break out of the CSS
// declaration it is written into. Anything unknown is rejected.

/** The colour roles of the theme (styles/theme.css in the Hexa Noir package). */
export const COLOR_ROLES = [
  "page",
  "page-raised",
  "panel",
  "copy",
  "copy-dim",
  "signal",
  "on-signal",
  "on-signal-dim",
  "brand",
  "line",
  "paper",
  "paper-ink",
  "paper-dim",
  "paper-rule",
  "redact",
] as const;

export const FONT_ROLES = ["display", "body", "mono"] as const;

/** The type scale; each step is a `--text-<step>` token. */
export const TYPE_STEPS = [
  "label",
  "title",
  "statement",
  "promise",
  "question",
  "display-md",
  "display-hero",
  "display-pillar",
  "display-lg",
  "display-xl",
] as const;

export const MOTION_EASES = ["expo-out", "power3-out", "cut"] as const;

/** #hex, rgb(), hsl(), oklch() or oklab(); digits and separators only inside. */
const colorValue = z
  .string()
  .trim()
  .regex(/^(#[0-9a-fA-F]{3,8}|(rgb|rgba|hsl|hsla|oklch|oklab)\([0-9.,%\s/+-]+\))$/, "Use a hex, rgb(), hsl() or oklch() colour.");

/** A length: a number with a unit, or clamp()/min()/max()/calc() over numbers, units and vw/vh. */
const lengthValue = z
  .string()
  .trim()
  .max(80)
  .regex(
    /^(-?\d*\.?\d+(px|rem|em|vw|vh|svh|%)|(clamp|min|max|calc)\([0-9a-z.%,\s+\-*/()]+\))$/,
    "Use a length like 1.5rem, 140px or clamp(2rem, 5vw, 4rem).",
  );

const easeValue = z
  .string()
  .trim()
  .regex(/^cubic-bezier\(\s*-?[\d.]+\s*,\s*-?[\d.]+\s*,\s*-?[\d.]+\s*,\s*-?[\d.]+\s*\)$/, "Use cubic-bezier(a, b, c, d).");

/** A file inside the pack's assets folder. */
export const assetPath = z.string().regex(/^assets\/[a-z0-9][a-z0-9._-]{0,80}$/, "Use assets/<lower-case-name>.");

const fontFile = z
  .object({
    src: assetPath.refine((src) => src.endsWith(".woff2"), "Fonts must be .woff2 files."),
    /** A weight (400) or a variable font's range ("100 900"). */
    weight: z.union([z.number().int().min(100).max(900), z.string().regex(/^[1-9]00 [1-9]00$/)]).default(400),
    style: z.enum(["normal", "italic"]).default("normal"),
  })
  .strict();

const fontToken = z
  .object({
    family: z.string().trim().regex(/^[A-Za-z0-9][A-Za-z0-9 -]{0,59}$/, "Letters, digits, spaces and hyphens only."),
    /** Fallback families, comma separated, e.g. "Helvetica Neue, Arial, sans-serif". */
    fallback: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9 ,-]{0,120}$/, "Letters, digits, spaces, commas and hyphens only.")
      .default("sans-serif"),
    files: z.array(fontFile).max(6).default([]),
  })
  .strict();

const partialRecord = <K extends readonly [string, ...string[]], V extends z.ZodType>(keys: K, value: V) =>
  z.object(Object.fromEntries(keys.map((key) => [key, value.optional()])) as { [P in K[number]]: z.ZodOptional<V> }).strict();

export const themeTokensSchema = z
  .object({
    colors: partialRecord(COLOR_ROLES, colorValue).default({}),
    fonts: partialRecord(FONT_ROLES, fontToken).default({}),
    type: partialRecord(TYPE_STEPS, lengthValue).default({}),
    space: partialRecord(["section", "chapter", "page"] as const, lengthValue).default({}),
    radius: partialRecord(["pill"] as const, lengthValue).default({}),
    motion: partialRecord(MOTION_EASES, easeValue).default({}),
  })
  .strict();

export type ThemeTokens = z.infer<typeof themeTokensSchema>;

export const themeManifestSchema = z
  .object({
    name: z.string().trim().min(1).max(60),
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lower-case words joined by hyphens.").max(40),
    version: z.string().regex(/^\d+\.\d+\.\d+$/, "Use a version like 1.0.0."),
    author: z.string().trim().max(80).default(""),
    description: z.string().trim().max(300).default(""),
    tokens: themeTokensSchema.default({ colors: {}, fonts: {}, type: {}, space: {}, radius: {}, motion: {} }),
  })
  .strict();

export type ThemeManifest = z.infer<typeof themeManifestSchema>;
