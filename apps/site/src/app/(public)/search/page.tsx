import Link from "next/link";
import { apiUrl, readJson } from "@hexapixora/sdk/server";
import { SiteLayout } from "@/components/public/site-layout";
import { EmptyState } from "@hexapixora/theme-hexa-noir/components/empty-state";
import { PageHeader } from "@hexapixora/theme-hexa-noir/components/page-header";
import { PILL_CLASS } from "@hexapixora/theme-hexa-noir/components/safe-link";

export const dynamic = "force-dynamic";

type Result = {
  type: "blog" | "page";
  title: string;
  snippet: string;
  url: string;
};

async function getResults(q: string): Promise<Result[]> {
  if (!q || q.trim().length < 2) return [];
  const res = await fetch(apiUrl(`/search?q=${encodeURIComponent(q.trim())}&limit=25`), {
    cache: "no-store",
  }).catch(() => null);
  const data = await readJson(res);
  return Array.isArray(data?.results) ? data.results : [];
}

/** Results only link inside the site: a relative path, never another host. */
const isLocalPath = (url: string) => url.startsWith("/") && !url.startsWith("//");

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
  const results = (await getResults(query)).filter((r) => typeof r.url === "string" && isLocalPath(r.url));
  const blogs = results.filter((r) => r.type === "blog");
  const pages = results.filter((r) => r.type === "page");
  const tooShort = query.trim().length < 2;

  return (
    <SiteLayout>
      <div className="pb-section">
        <PageHeader eyebrow="Search" title="Find it">
          {/* A plain GET form: works without JS, and results are bookmarkable. */}
          <form action="/search" method="get" role="search" className="mt-10 flex max-w-3xl items-end gap-5">
            <label htmlFor="search-q" className="sr-only">
              Search insights and pages
            </label>
            <input
              id="search-q"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search insights and pages"
              className="w-full flex-1 border-b border-line bg-transparent py-3 text-xl outline-none transition-colors placeholder:text-copy-dim focus:border-signal"
            />
            <button
              type="submit"
              className={`${PILL_CLASS} shrink-0 bg-signal px-5 py-3.5 text-sm text-on-signal hover:bg-copy hover:text-page`}
            >
              Search <span aria-hidden="true">→</span>
            </button>
          </form>
        </PageHeader>

        <div className="page-width">
          {tooShort ? (
            <p className="text-copy-dim">Type at least 2 characters to search.</p>
          ) : results.length === 0 ? (
            <EmptyState label="No results">
              Nothing matched <span className="text-copy">“{query}”</span>. Try different keywords.
            </EmptyState>
          ) : (
            <div className="grid max-w-3xl gap-16">
              <p role="status" className="mono text-copy-dim">
                {results.length} result{results.length === 1 ? "" : "s"} for{" "}
                <span className="text-copy">“{query}”</span>
              </p>
              {blogs.length > 0 ? <ResultGroup id="results-insights" title="Insights" items={blogs} /> : null}
              {pages.length > 0 ? <ResultGroup id="results-pages" title="Pages" items={pages} /> : null}
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}

function ResultGroup({ id, title, items }: { id: string; title: string; items: Result[] }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="mono mb-6 flex items-center gap-4 text-copy-dim">
        {title} <span className="text-signal">{items.length}</span>
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
      </h2>
      <ul>
        {items.map((r, i) => (
          <li key={`${r.url}-${i}`} className="border-t border-line last:border-b">
            <Link href={r.url} className="group block py-6">
              <h3 className="wide text-title font-medium transition-colors group-hover:text-signal">{r.title}</h3>
              {r.snippet ? <p className="mt-2 line-clamp-2 text-copy-dim">{r.snippet}</p> : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
