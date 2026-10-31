import { cache } from "react";
import { cmsFetch, readJson } from "@hexapixora/sdk/server";
import { HEXA_NOIR_TOKENS } from "@hexapixora/contracts/theme-pack/hexa-noir";
import { tokensToCss } from "@hexapixora/contracts/theme-pack/tokens-to-css";
import { isDarkColor, lastDeclaration } from "./color";

// The built-in theme's roles, always present so the admin has every token
// even when no pack is active or a pack overrides only some of them.
const BUILT_IN_CSS = tokensToCss(HEXA_NOIR_TOKENS, (path) => path);

export type AdminTheme = {
  /** Built-in tokens, then the active pack's CSS (its overrides win). */
  css: string;
  /** The active pack's name, or the built-in theme's. */
  name: string;
  /** Whether the theme's page colour is dark (sets the admin's colour scheme). */
  dark: boolean;
};

/** Compiled theme CSS never contains markup; refuse it if it somehow does. */
const isSafeCss = (css: unknown): css is string => typeof css === "string" && !/<\//.test(css);

/**
 * The theme the admin wears: the active pack's tokens over the built-in Hexa
 * Noir ones (plans/admin-redesign). Read fresh on every full load, so
 * activating a pack restyles the admin right away. An unreachable API falls
 * back to the built-in theme.
 */
export const getAdminTheme = cache(async (): Promise<AdminTheme> => {
  const res = await cmsFetch("/themes/active", { cache: "no-store" }).catch(() => null);
  const pack = (await readJson(res))?.data as { name?: unknown; css?: unknown } | null | undefined;
  const packCss = isSafeCss(pack?.css) ? pack.css : "";
  const css = packCss ? `${BUILT_IN_CSS}\n${packCss}` : BUILT_IN_CSS;
  return {
    css,
    name: typeof pack?.name === "string" && packCss ? pack.name : "Hexa Noir",
    dark: isDarkColor(lastDeclaration(css, "--color-page") ?? HEXA_NOIR_TOKENS.colors.page ?? "#000"),
  };
});
