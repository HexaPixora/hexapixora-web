import Link from "next/link";
import { Search, Newspaper, FileText } from "lucide-react";
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

  return (
    <SiteLayout>
      <div className="container max-w-3xl py-16 md:py-24">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Search</h1>

        {/* No-JS GET form — bookmarkable, shareable. */}
        <form action="/search" method="get" className="flex items-center gap-2 rounded-full border bg-background pl-4 pr-2 h-12 shadow-sm mb-10">
          <Search size={18} className="text-muted-foreground shrink-0" />
          <input
            name="q"
            defaultValue={query}
            autoFocus
            placeholder="Search blogs and pages…"
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
          <button type="submit" className="rounded-full bg-primary text-primary-foreground text-sm font-semibold px-4 h-9 hover:bg-primary/90 transition-colors">
            Search
          </button>
        </form>

        {query.trim().length < 2 ? (
          <p className="text-muted-foreground">Type at least 2 characters to search.</p>
        ) : results.length === 0 ? (
          <p className="text-muted-foreground">
            No results for <span className="font-semibold text-foreground">“{query}”</span>. Try different keywords.
          </p>
        ) : (
          <div className="space-y-10">
            <p className="text-sm text-muted-foreground">
              {results.length} result{results.length === 1 ? "" : "s"} for “{query}”
            </p>

            {blogs.length > 0 && <ResultGroup title="Blog" icon={<Newspaper size={16} />} items={blogs} />}
            {pages.length > 0 && <ResultGroup title="Pages" icon={<FileText size={16} />} items={pages} />}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

function ResultGroup({ title, icon, items }: { title: string; icon: React.ReactNode; items: Result[] }) {
  return (
    <section>
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        {icon} {title}
      </h2>
      <div className="flex flex-col divide-y">
        {items.map((r, i) => (
          <Link key={`${r.url}-${i}`} href={r.url} className="group py-4 transition-colors">
            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{r.title}</h3>
            {r.snippet && <p className="text-muted-foreground line-clamp-2 mt-1">{r.snippet}</p>}
          </Link>
        ))}
      </div>
    </section>
  );
}
