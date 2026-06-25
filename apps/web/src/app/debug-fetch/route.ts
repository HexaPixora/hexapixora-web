import { apiUrl } from "@/lib/api-url";

// TEMPORARY diagnostic — shows what the Vercel server runtime actually sees when
// it fetches the CMS API. Remove after debugging the /about-us 404.
export const dynamic = "force-dynamic";

export async function GET() {
  const out: Record<string, unknown> = {
    env: {
      API_URL: process.env.API_URL ?? null,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? null,
      PREVIEW_TOKEN_set: Boolean(process.env.PREVIEW_TOKEN),
    },
  };

  for (const p of ["/pages/homepage", "/pages/about-us", "/pages"]) {
    const url = apiUrl(p);
    try {
      const res = await fetch(url, { cache: "no-store" });
      const text = await res.text();
      out[p] = { url, status: res.status, ok: res.ok, bodyStart: text.slice(0, 160) };
    } catch (e) {
      out[p] = { url, error: String((e as Error)?.message ?? e) };
    }
  }

  return Response.json(out);
}
