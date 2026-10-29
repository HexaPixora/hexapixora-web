/** Navigation data as the layouts API returns it. */
export type MenuItem = {
  id: string;
  label: string;
  url: string;
  target?: "_self" | "_blank";
  children?: MenuItem[];
};

export type Navigation = {
  id: string;
  name: string;
  items: MenuItem[];
};

/** Layout data the app loads from the API and hands to the theme. */
export type SiteShellData = {
  settings: Record<string, unknown> | null;
  headerConfig: unknown;
  footerConfig: unknown;
  navigations: Navigation[];
};

export const EMPTY_SITE_SHELL_DATA: SiteShellData = {
  settings: null,
  headerConfig: null,
  footerConfig: null,
  navigations: [],
};

export function findNavItems(navigations: Navigation[], id: string | undefined): MenuItem[] {
  if (!id) return [];
  return navigations.find((nav) => nav.id === id)?.items ?? [];
}

/** Reads a string setting, ignoring anything that isn't one. */
export function settingText(settings: SiteShellData["settings"], key: string): string {
  const value = settings?.[key];
  return typeof value === "string" ? value : "";
}
