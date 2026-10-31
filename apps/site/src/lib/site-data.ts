import { cache } from "react";
import { apiUrl, readJson } from "@hexapixora/sdk/server";

// Site-wide records: settings, header, footer and menus. Every reader goes
// through these loaders, so a page asks for each one once: cache() shares the
// call within a render, and the same fetch options let Next reuse the cached
// response across metadata, layouts and routes. Content saves refresh them
// through the revalidate hook.
const LAYOUT_FETCH = { next: { revalidate: 120 } };

// readJson never throws on an empty or invalid body, and a failed request
// reads as null, so one missing record can't take a page down.
async function load(path: string): Promise<any> {
  const res = await fetch(apiUrl(path), LAYOUT_FETCH).catch(() => null);
  return readJson(res);
}

/** The SiteSetting row (a flat object, unlike the layout records). */
export const getSettings = cache(
  async (): Promise<Record<string, any> | null> => (await load("/settings")) ?? null,
);

export const getHeaderConfig = cache(async () => (await load("/layouts/header"))?.data ?? null);

export const getFooterConfig = cache(async () => (await load("/layouts/footer"))?.data ?? null);

export const getNavigations = cache(async () => (await load("/layouts/navigations"))?.data ?? []);
