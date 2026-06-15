import React from "react";
import SiteLayout from "@/components/public/site-layout";
import Link from "next/link";
import { ArrowRight, Calendar, BookOpen, Clock, Tag } from "lucide-react";
import { Metadata } from "next";
import { apiUrl } from "@/lib/api-url";

export const metadata: Metadata = {
  title: "Blog | HexaPixora Digital Agency",
  description: "Read the latest news, insights, trends, and tutorials about design, development, marketing, and technology from the HexaPixora team.",
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": "/blog/feed.xml" },
  },
};

async function getBlogs(category?: string) {
  try {
    let url = apiUrl("/blogs?published=true&limit=100");
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    const res = await fetch(url, { cache: "no-store" });
    const json = await res.json();
    return json?.data || [];
  } catch (err) {
    return [];
  }
}

async function getCategories() {
  try {
    const res = await fetch(apiUrl("/blogs/categories"), { cache: "no-store" });
    return await res.json();
  } catch (err) {
    return [];
  }
}

interface BlogPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function PublicBlogPage(props: BlogPageProps) {
  const searchParams = await props.searchParams;
  const currentCategory = searchParams.category || "";
  
  const [posts, categories] = await Promise.all([
    getBlogs(currentCategory),
    getCategories()
  ]);

  return (
    <SiteLayout showHeader={true} showFooter={true}>
      <div className="flex-1 bg-background relative overflow-hidden pb-24">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Hero Header */}
        <div className="border-b bg-muted/20 relative z-10">
          <div className="container py-16 md:py-24 text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
              <BookOpen size={13} />
              <span>HexaPixora Insights</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent mb-6">
              Ideas, Stories & Tech Trends
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Explore resources, guides, and thoughts on how to build, scale, and optimize your modern web applications and digital brand presence.
            </p>
          </div>
        </div>

        <div className="container mt-12 relative z-10">
          {/* Category Filter Pills */}
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12 border-b pb-8">
              <Link
                href="/blog"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  !currentCategory
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.03]"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                }`}
              >
                All Articles
              </Link>
              {categories.map((cat: string) => (
                <Link
                  key={cat}
                  href={`/blog?category=${encodeURIComponent(cat)}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                    currentCategory === cat
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.03]"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {cat}
                </Link>
              ))}
            </div>
          )}

          {/* Blog Grid */}
          {posts.length === 0 ? (
            <div className="text-center py-20 border border-dashed rounded-3xl bg-muted/10 max-w-xl mx-auto">
              <Tag size={40} className="mx-auto mb-4 text-muted-foreground opacity-40 animate-pulse" />
              <h3 className="text-lg font-bold mb-2">No articles found</h3>
              <p className="text-muted-foreground text-sm">
                We couldn't find any published articles {currentCategory ? `in "${currentCategory}"` : ""}. Check back later!
              </p>
              {currentCategory && (
                <Link href="/blog" className="inline-block mt-4 text-sm text-primary font-semibold hover:underline">
                  Clear filter & view all
                </Link>
              )}
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
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                        No Image Available
                      </div>
                    )}
                    {post.category && (
                      <div className="absolute top-4 left-4 bg-primary/95 text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                        {post.category}
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} />
                          {new Date(post.publishDate || post.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        {post.readTime && (
                          <span className="flex items-center gap-1">
                            <Clock size={13} />
                            {post.readTime} min read
                          </span>
                        )}
                      </div>

                      <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                        {post.title}
                      </h2>

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
