import Link from "next/link";
import { EmptyState } from "./empty-state";
import { InsightCard, type InsightPost } from "./insight-card";
import { PageHeader } from "./page-header";

export type InsightCategoryInfo = {
  name: string;
  slug?: string;
  description?: string | null;
};

/** Category browse view, rendered by /insights/[slug] when the slug is a category rather than a post. */
export function InsightCategoryView({ category, posts }: { category: InsightCategoryInfo; posts: InsightPost[] }) {
  const count = `${posts.length} ${posts.length === 1 ? "insight" : "insights"}`;
  return (
    <div className="pb-section">
      <PageHeader
        eyebrow={
          <>
            <Link href="/insights" className="transition-colors hover:text-copy">
              Insights
            </Link>
            {" / "}Category
          </>
        }
        title={category.name}
        intro={category.description || undefined}
      >
        <p className="mono mt-6 text-copy-dim">{count}</p>
      </PageHeader>

      <div className="page-width">
        {posts.length === 0 ? (
          <EmptyState label="Nothing here yet">There are no published insights in this category yet.</EmptyState>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.id ?? post.slug}>
                <InsightCard post={post} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
