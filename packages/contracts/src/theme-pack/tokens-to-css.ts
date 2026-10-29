import { COLOR_ROLES, FONT_ROLES, MOTION_EASES, TYPE_STEPS, type ThemeTokens } from "./schema";

/** Turns a pack's asset path ("assets/x.woff2") into the URL it is served from. */
export type AssetUrl = (path: string) => string;

/** A URL inside CSS url("…"); quotes, backslashes and line breaks can't end the string. */
const cssUrl = (url: string) => `url("${encodeURI(url).replace(/["\\\n\r]/g, (ch) => encodeURIComponent(ch))}")`;

/** Families with spaces are quoted; generic families (sans-serif) stay bare. */
const familyList = (family: string, fallback: string) =>
  [family, ...fallback.split(",")]
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => (/^(serif|sans-serif|monospace|cursive|system-ui|ui-monospace)$/.test(name) ? name : `"${name}"`))
    .join(", ");

/**
 * The CSS for a pack's tokens: @font-face rules, colour, type, space and
 * motion overrides on :root, and the font stacks on body (where the theme
 * declares them). Values were validated by the schema; this only assembles.
 */
export function tokensToCss(tokens: ThemeTokens, assetUrl: AssetUrl): string {
  const out: string[] = [];
  const root: string[] = [];
  const body: string[] = [];

  for (const role of FONT_ROLES) {
    const font = tokens.fonts[role];
    if (!font) continue;
    for (const file of font.files) {
      out.push(
        `@font-face{font-family:"${font.family}";src:${cssUrl(assetUrl(file.src))} format("woff2");` +
          `font-weight:${file.weight};font-style:${file.style};font-display:swap}`,
      );
    }
    body.push(`--font-${role}:${familyList(font.family, font.fallback)}`);
  }

  for (const role of COLOR_ROLES) {
    const value = tokens.colors[role];
    if (value) root.push(`--color-${role}:${value}`);
  }
  for (const step of TYPE_STEPS) {
    const value = tokens.type[step];
    if (value) root.push(`--text-${step}:${value}`);
  }
  if (tokens.space.section) root.push(`--spacing-section:${tokens.space.section}`);
  if (tokens.space.chapter) root.push(`--spacing-chapter:${tokens.space.chapter}`);
  if (tokens.space.page) root.push(`--container-page:${tokens.space.page}`);
  if (tokens.radius.pill) root.push(`--radius-pill:${tokens.radius.pill}`);
  for (const ease of MOTION_EASES) {
    const value = tokens.motion[ease];
    if (value) root.push(`--ease-${ease}:${value}`);
  }

  if (root.length) out.push(`:root{${root.join(";")}}`);
  if (body.length) out.push(`body{${body.join(";")}}`);
  return out.join("\n");
}
