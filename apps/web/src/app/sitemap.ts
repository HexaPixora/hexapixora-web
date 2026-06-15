import type { MetadataRoute } from "next";
import { apiUrl } from "@/lib/api-url";
import { siteUrl } from "@/lib/site-url";

// Regenerate at most once an hour — content changes also trigger on-demand
// revalidation elsewhere, so this is just a safety net for the sitemap.
export const revalidate = 3600;

async function getJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(apiUrl(path), { next: { revalidate } });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pagesRes, blogsRes] = await Promise.all([
    getJson<{ data?: any[] }>("/pages", { data: [] }),
    getJson<{ data?: any[] }>("/blogs?published=true&limit=1000", { data: [] }),
  ]);

  const pages = pagesRes?.data ?? [];
  const blogs = blogsRes?.data ?? [];

  // Static, always-present routes.
  const staticEntries: MetadataRoute.Sitemap = [
    { url: siteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: siteUrl("/blog"), changeFrequency: "daily", priority: 0.8 },
  ];

  // CMS-authored pages rendered at /[slug]. Skip "home" if present — it maps
  // to "/" which is already listed above.
  const pageEntries: MetadataRoute.Sitemap = pages
    .filter((p) => p?.slug && p.slug !== "home")
    .map((p) => ({
      url: siteUrl(`/${p.slug}`),
      lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  const blogEntries: MetadataRoute.Sitemap = blogs
    .filter((b) => b?.slug)
    .map((b) => ({
      url: siteUrl(`/blog/${b.slug}`),
      lastModified: b.updatedAt
        ? new Date(b.updatedAt)
        : b.publishDate
          ? new Date(b.publishDate)
          : undefined,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  return [...staticEntries, ...pageEntries, ...blogEntries];
}
