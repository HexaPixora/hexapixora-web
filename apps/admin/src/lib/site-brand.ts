import { cache } from "react";
import { cmsFetch, readJson } from "@hexapixora/sdk/server";

export type SiteBrand = {
  siteName: string;
  tagline: string | null;
  logoUrl: string | null;
};

const text = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : null);

/**
 * Name, tagline and logo from Settings, for screens shown before sign-in.
 * Same request and cache as the favicon lookup in the root layout, so Next
 * fetches it once. An unreachable API falls back to a plain "Admin".
 */
export const getSiteBrand = cache(async (): Promise<SiteBrand> => {
  const res = await cmsFetch("/settings", { next: { revalidate: 300 } }).catch(() => null);
  const settings = (await readJson(res)) as Record<string, unknown> | null;
  return {
    siteName: text(settings?.siteName) ?? "Admin",
    tagline: text(settings?.tagline),
    logoUrl: text(settings?.logoUrl),
  };
});
