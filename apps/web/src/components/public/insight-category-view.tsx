import React from "react";
import Link from "next/link";
import { ArrowLeft, Tag } from "lucide-react";
import { InsightCard } from "@/components/public/insight-card";

/** Category browse view, rendered by /insights/[slug] when the slug resolves to
 *  a category rather than a post. */
export function InsightCategoryView({ category, posts }: { category: any; posts: any[] }) {
  return (
    <div className="relative isolate flex-1 overflow-hidden pb-24">
      <div aria-hidden className="pointer-events-none absolute -left-32 top-0 -z-10 h-[42vh] w-[42vh] rounded-full bg-[rgba(16,147,253,0.14)] blur-[130px]" />

      <header className="container relative z-10 max-w-3xl pb-4 pt-16 text-center md:pt-24">
        <span
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3.5 py-1.5 text-xs font-semibold text-[#7cc4ff] ring-1 ring-inset ring-white/10 backdrop-blur-xl"
          style={category.color ? { color: category.color, borderColor: `${category.color}66` } : undefined}
        >
          <Tag size={13} /> Category
        </span>
        <h1 className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-4xl font-black leading-[1.1] tracking-tight text-transparent md:text-5xl">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{category.description}</p>
        )}
        <p className="mt-4 text-sm text-muted-foreground">
          {posts.length} {posts.length === 1 ? "insight" : "insights"}
        </p>
      </header>

      <div className="container relative z-10 mt-8">
        <Link
          href="/insights"
          className="group mb-10 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-[#7cc4ff]"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          All insights
        </Link>

        {posts.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-14 text-center ring-1 ring-inset ring-white/10">
            <Tag size={40} className="mx-auto mb-4 text-muted-foreground opacity-40" />
            <h3 className="text-lg font-bold">No insights yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">There are no published insights in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p: any) => (
              <InsightCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
