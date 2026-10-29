import postcss, { type AtRule, type Declaration, type Rule } from "postcss";
import type { AssetUrl } from "./tokens-to-css";

/** theme.css is capped so a pack can't bloat every page. */
export const THEME_CSS_MAX_BYTES = 100 * 1024;

const ALLOWED_AT_RULES = new Set(["media", "supports", "keyframes", "font-face"]);

/** Selectors may only reach the site through the theme hooks. */
const HOOK = /\[data-(block|part|variant|surface)\b/;

const DANGEROUS = /expression\s*\(|javascript:|vbscript:|behavior\s*:|-moz-binding|@import|<\/?\s*style/i;

export type SanitizedCss = { css: string; removed: string[] };

/**
 * Cleans a pack's theme.css by parsing it, not by pattern-matching text.
 * Kept: rules that target the theme hooks ([data-block], [data-part],
 * [data-variant], [data-surface]); custom properties on :root and body;
 * @media, @supports, @keyframes and @font-face. url() may only point at the
 * pack's own assets/, rewritten to where they are served. Everything else
 * is dropped and listed in `removed`.
 */
export function sanitizeThemeCss(source: string, assetUrl: AssetUrl, assets: ReadonlySet<string>): SanitizedCss {
  if (new TextEncoder().encode(source).length > THEME_CSS_MAX_BYTES) {
    throw new Error(`theme.css is larger than ${THEME_CSS_MAX_BYTES / 1024} KB.`);
  }
  const root = postcss.parse(source);
  const removed: string[] = [];
  const drop = (node: { remove(): void; toString(): string }, why: string) => {
    removed.push(`${why}: ${node.toString().slice(0, 80).replace(/\s+/g, " ")}`);
    node.remove();
  };

  root.walkComments((comment) => {
    comment.remove();
  });

  root.walkAtRules((rule: AtRule) => {
    if (!ALLOWED_AT_RULES.has(rule.name.toLowerCase())) drop(rule, `@${rule.name} is not allowed`);
  });

  root.walkRules((rule: Rule) => {
    const inKeyframes = rule.parent?.type === "atrule" && /keyframes$/i.test((rule.parent as AtRule).name);
    if (inKeyframes) return;
    const ok = rule.selectors.every((selector) => {
      const s = selector.trim();
      if (s === ":root" || s === "body") return rule.nodes.every((n) => n.type !== "decl" || n.prop.startsWith("--"));
      return HOOK.test(s);
    });
    if (!ok) drop(rule, "selector outside the theme hooks");
  });

  root.walkDecls((decl: Declaration) => {
    if (!/^(--)?[a-zA-Z-]+$/.test(decl.prop)) return drop(decl, "invalid property");
    if (DANGEROUS.test(decl.prop) || DANGEROUS.test(decl.value)) return drop(decl, "unsafe value");
    if (!/url\(/i.test(decl.value)) return;

    let unknown = false;
    decl.value = decl.value.replace(/url\(\s*(['"]?)([^'")\s]*)\1\s*\)/gi, (_match, _quote, path: string) => {
      if (!assets.has(path)) {
        unknown = true;
        return "none";
      }
      return `url("${encodeURI(assetUrl(path))}")`;
    });
    if (unknown || /url\(\s*(?!")/i.test(decl.value)) drop(decl, "url() outside the pack's assets");
  });

  // Rules and at-rules left empty by the cleaning go too.
  root.walk((node) => {
    if ((node.type === "rule" || node.type === "atrule") && node.nodes && node.nodes.length === 0) node.remove();
  });

  const css = root.toString();
  if (/<\//.test(css)) throw new Error("theme.css contains markup.");
  return { css, removed };
}
