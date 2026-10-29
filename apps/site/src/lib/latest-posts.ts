import { cmsFetch, readJson } from "@hexapixora/sdk/server";

type Section = { type?: string; isVisible?: boolean };

/**
 * Latest published posts for pages that contain a blog block. Themes never
 * fetch, so the page loads them here and hands them to the renderer. Pages
 * without a blog block skip the request entirely.
 */
export async function getLatestPosts(sections: unknown): Promise<unknown[]> {
  const list = Array.isArray(sections) ? (sections as Section[]) : [];
  if (!list.some((section) => section.isVisible && section.type === "BlogSection")) return [];
  const res = await cmsFetch("/blogs?published=true&limit=12", { next: { revalidate: 120 } }).catch(
    () => null,
  );
  const data = (await readJson(res)) as { data?: unknown } | null;
  return Array.isArray(data?.data) ? data.data : [];
}
