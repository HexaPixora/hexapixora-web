import { useId } from "react";
import Link from "next/link";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { blogSchema } from "@hexapixora/contracts/blocks/legacy/blog";
import { InsightCard, type InsightPost } from "../../components/insight-card";
import { SectionFrame } from "../../components/section-frame";
import { SectionHeading } from "../../components/section-heading";

/**
 * The latest articles as insight cards. The posts are loaded by the app and
 * passed in (themes never fetch); with none, the block renders nothing.
 */
export function BlogBlock({ config, posts = [] }: { config?: unknown; posts?: unknown[] }) {
  const c = parseBlockConfig(blogSchema, config);
  const headingId = useId();
  const limit = Math.max(1, parseInt(c.limit, 10) || 3);
  const list = (posts as InsightPost[]).filter((post) => post?.slug && post?.title).slice(0, limit);
  if (list.length === 0) return null;

  return (
    <SectionFrame block="blog" labelledBy={c.heading ? headingId : undefined}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading id={headingId} heading={c.heading} subheading={c.subheading} />
        <Link href="/insights" className="mono mb-chapter transition-colors hover:text-signal">
          All insights <span aria-hidden="true">→</span>
        </Link>
      </div>
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {list.map((post) => (
          <li key={post.id ?? post.slug}>
            <InsightCard post={post} />
          </li>
        ))}
      </ul>
    </SectionFrame>
  );
}
