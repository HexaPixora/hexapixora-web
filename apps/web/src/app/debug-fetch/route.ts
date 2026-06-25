import { apiUrl } from "@/lib/api-url";
import { cmsFetch, isPreview } from "@/lib/cms-fetch";

// TEMPORARY diagnostic — replicates getPageData's exact path to find the /about-us 404.
export const dynamic = "force-dynamic";

async function getPageDataReplica(slug: string) {
  try {
    const [pageRes, defaultsRes] = await Promise.all([
      cmsFetch(`/pages/${slug}`, { cache: "no-store" }),
      cmsFetch("/layouts/module-defaults", { cache: "no-store" }),
    ]);
    if (!pageRes.ok) return { result: "null", reason: `pageRes not ok: ${pageRes.status}` };
    const pageJson = await pageRes.json();
    const pageData = pageJson.data;
    if (!pageData) return { result: "null", reason: "pageJson.data is falsy", pageJson };
    return { result: "DATA", title: pageData.title, slug: pageData.slug, defaultsOk: defaultsRes.ok };
  } catch (e) {
    return { result: "null", reason: "threw", error: String((e as Error)?.message ?? e) };
  }
}

export async function GET() {
  const preview = await isPreview();
  const rawAbout = await fetch(apiUrl("/pages/about-us"), { cache: "no-store" })
    .then((r) => ({ status: r.status, ok: r.ok }))
    .catch((e) => ({ error: String(e?.message ?? e) }));
  return Response.json({
    isPreview: preview,
    rawFetch_about_us: rawAbout,
    getPageDataReplica_about_us: await getPageDataReplica("about-us"),
    getPageDataReplica_homepage: await getPageDataReplica("homepage"),
  });
}
