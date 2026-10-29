import { cmsFetch, readJson } from "@hexapixora/sdk/server";
import { isSafeThemeCss } from "./theme-css";

/**
 * The active theme pack's CSS (token overrides, @font-face rules and its
 * sanitised theme.css), compiled by the API on install (plans/phase-3b).
 * Empty when no pack is active or the API can't be reached: the built-in
 * Hexa Noir tokens then apply. Activating a pack revalidates the site.
 */
export async function getThemePackCss(): Promise<string> {
  const res = await cmsFetch("/themes/active", { next: { revalidate: 120 } }).catch(() => null);
  const body = (await readJson(res)) as { data?: { css?: unknown } } | null;
  const css = body?.data?.css;
  return isSafeThemeCss(css) ? css : "";
}
