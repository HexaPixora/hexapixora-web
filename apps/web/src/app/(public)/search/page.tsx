import Link from "next/link";
import { Search, Newspaper, FileText, ArrowUpRight, SearchX } from "lucide-react";
import SiteLayout from "@/components/public/site-layout";
import { apiUrl } from "@/lib/api-url";
import { readJson } from "@/lib/cms-fetch";

export const dynamic = "force-dynamic";

type Result = { type: "blog" | "page"; title: string; snippet: string; url: string };

async function getResults(q: string): Promise<Result[]> {
  if (!q || q.trim().length < 2) return [];
  const res = await fetch(apiUrl(`/search?q=${encodeURIComponent(q.trim())}&limit=25`), {
    cache: "no-store",
  }).catch(() => null);
  const data = await readJson(res);
  return Array.isArray(data?.results) ? data.results : [];
}

export async function generateMetadata(props: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await props.searchParams;
  return {
    title: q ? `Search: ${q}` : "Search",
    // Search result pages shouldn't be indexed.
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage(props: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await props.searchParams;
  const query = q.toString();
  const results = await getResults(query);
  const blogs = results.filter((r) => r.type === "blog");
  const pages = results.filter((r) => r.type === "page");
  const tooShort = query.trim().length < 2;

  return (
    <SiteLayout>
      <div className="relative isolate flex-1 overflow-hidden">
        {/* Ambient aurora */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[36vh] w-[70vh] -translate-x-1/2 rounded-full bg-[rgba(16,147,253,0.12)] blur-[120px]" />

        <div className="container max-w-3xl py-16 md:py-24">
          <h1 className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-3xl font-black tracking-tight text-transparent md:text-5xl">
            Search
          </h1>

          {/* No-JS GET form — bookmarkable & shareable. */}
          <form
            action="/search"
            method="get"
            className="mb-10 mt-6 flex h-14 items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] pl-4 pr-2 ring-1 ring-inset ring-white/10 transition-colors focus-within:border-[#7cc4ff]/50 focus-within:ring-[#7cc4ff]/40"
          >
            <Search size={18} className="shrink-0 text-muted-foreground" />
            <input
              name="q"
              defaultValue={query}
              autoFocus
              placeholder="Search insights and pages…"
              className="h-full flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="h-10 shrink-0 rounded-full bg-gradient-to-b from-[#2a9dff] to-[#1074e0] px-5 text-sm font-semibold text-white shadow-[0_10px_26px_-10px_rgba(16,147,253,0.8)] transition-all hover:-translate-y-0.5"
            >
              Search
            </button>
          </form>

          {tooShort ? (
            <p className="text-muted-foreground">Type at least 2 characters to search.</p>
          ) : results.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center ring-1 ring-inset ring-white/10">
              <SearchX size={40} className="mx-auto mb-4 text-muted-foreground opacity-40" />
              <h3 className="text-lg font-bold">No results found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Nothing matched <span className="font-medium text-foreground">“{query}”</span>. Try different keywords.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              <p className="text-sm text-muted-foreground">
                {results.length} result{results.length === 1 ? "" : "s"} for{" "}
                <span className="font-medium text-foreground">“{query}”</span>
              </p>

              {blogs.length > 0 && <ResultGroup title="Insights" icon={<Newspaper size={15} />} items={blogs} />}
              {pages.length > 0 && <ResultGroup title="Pages" icon={<FileText size={15} />} items={pages} />}
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}

function ResultGroup({ title, icon, items }: { title: string; icon: React.ReactNode; items: Result[] }) {
  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon} {title}
        <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium normal-case tracking-normal">
          {items.length}
        </span>
      </h2>
      <div className="space-y-3">
        {items.map((r, i) => (
          <Link
            key={`${r.url}-${i}`}
            href={r.url}
            className="group block rounded-2xl border border-white/10 bg-white/[0.03] p-4 ring-1 ring-inset ring-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:ring-white/20 sm:p-5"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#7cc4ff]">
                {icon}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground transition-colors group-hover:text-[#7cc4ff]">
                  {r.title}
                </h3>
                {r.snippet && <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{r.snippet}</p>}
              </div>
              <ArrowUpRight
                size={16}
                className="mt-1 flex-shrink-0 text-muted-foreground opacity-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#7cc4ff] group-hover:opacity-100"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
