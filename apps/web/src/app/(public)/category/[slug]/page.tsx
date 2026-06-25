import React from "react";
import SiteLayout from "@/components/public/site-layout";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Calendar, Clock, Tag } from "lucide-react";
import { Metadata } from "next";
import { apiUrl } from "@/lib/api-url";

async function getCategory(slug: string) {
  try {
    const res = await fetch(apiUrl(`/categories/${slug}`), { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getPosts(slug: string) {
  try {
    const res = await fetch(apiUrl(`/blogs?published=true&limit=100&category=${encodeURIComponent(slug)}`), { cache: "no-store" });
    const json = await res.json();
    return json?.data || [];
  } catch {
    return [];
  }
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const category = await getCategory(slug);
  if (!category) return { title: "Category Not Found | HexaPixora" };
  return {
    title: `${category.name} | HexaPixora`,
    description: category.description || `Articles in the ${category.name} category.`,
    alternates: { canonical: `/category/${category.slug}` },
  };
}

export default async function CategoryArchivePage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const posts = await getPosts(slug);

  return (
    <SiteLayout showHeader={true} showFooter={true}>
      <div className="flex-1 bg-background relative overflow-hidden pb-24">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Header */}
        <div className="border-b bg-muted/20 relative z-10">
          <div className="container py-16 md:py-20 text-center max-w-3xl">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold mb-6"
              style={category.color ? { color: category.color, borderColor: category.color } : undefined}
            >
              <Tag size={13} />
              <span>Category</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{category.name}</h1>
            {category.description && (
              <p className="text-lg text-muted-foreground leading-relaxed">{category.description}</p>
            )}
            <p className="mt-4 text-sm text-muted-foreground">
              {posts.length} {posts.length === 1 ? "article" : "articles"}
            </p>
          </div>
        </div>

        <div className="container mt-12 relative z-10">
          <Link href="/blog" className="mb-8 inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
            ← All articles
          </Link>

          {posts.length === 0 ? (
            <div className="text-center py-20 border border-dashed rounded-3xl bg-muted/10 max-w-xl mx-auto">
              <Tag size={40} className="mx-auto mb-4 text-muted-foreground opacity-40" />
              <h3 className="text-lg font-bold mb-2">No articles yet</h3>
              <p className="text-muted-foreground text-sm">There are no published articles in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post: any) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col h-full bg-card border border-muted/30 rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300"
                >
                  <div className="relative aspect-[16/9] bg-muted overflow-hidden">
                    {post.thumbnail ? (
                      <img src={post.thumbnail} alt={post.title} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-[1.04]" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No Image Available</div>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} />
                          {new Date(post.publishDate || post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        {post.readTime && (
                          <span className="flex items-center gap-1">
                            <Clock size={13} /> {post.readTime} min read
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">{post.title}</h2>
                      <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                        {post.excerpt || post.content?.replace(/<[^>]*>?/gm, "").substring(0, 140) + "..."}
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-primary flex items-center pt-6 mt-auto border-t border-muted/20">
                      <span>Read Article</span>
                      <ArrowRight className="ml-1.5 w-4 h-4 transition-transform group-hover:translate-x-1.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
