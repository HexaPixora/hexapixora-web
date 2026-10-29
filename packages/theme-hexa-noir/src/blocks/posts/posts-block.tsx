import { useId } from "react";
import Link from "next/link";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { postsSchema } from "@hexapixora/contracts/blocks/posts";
import { InsightCard, type InsightPost } from "../../components/insight-card";
import { BlockHead, labelledBy } from "../../components/block-head";
import { SectionFrame } from "../../components/section-frame";
import type { BlockProps } from "../../lib/block-props";

/**
 * The latest articles as insight cards. The posts are loaded by the app and
 * passed in (themes never fetch); with none, the block renders nothing.
 */
export function PostsBlock({ config, posts = [] }: BlockProps) {
  const c = parseBlockConfig(postsSchema, config);
  const headingId = useId();
  const limit = Math.max(1, parseInt(c.limit, 10) || 3);
  const list = (posts as InsightPost[]).filter((post) => post?.slug && post?.title).slice(0, limit);
  if (list.length === 0) return null;

  return (
    <SectionFrame block="posts" variant={c.layout} surface={c.surface} labelledBy={labelledBy(headingId, c)}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <BlockHead id={headingId} head={c} />
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
