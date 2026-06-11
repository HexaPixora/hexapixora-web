import React from "react";
import { blogSchema, BlogProps } from "@/lib/module-schemas/blog-schema";

import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";

async function getBlogs(limit: number) {
  try {
    const res = await fetch('http://localhost:3001/api/blogs?published=true', { cache: 'no-store' });
    const json = await res.json();
    return (json?.data || []).slice(0, limit);
  } catch (err) {
    return [];
  }
}

export default async function BlogModule({ config }: { config?: BlogProps }) {
  const { heading, subheading, limit } = blogSchema.parse(config || {});
  const maxItems = parseInt(limit) || 3;
  const posts = await getBlogs(maxItems);

  return (
    <section className="py-24 bg-muted/30 border-t">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-[600px]">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{heading}</h2>
            {subheading && <p className="text-lg text-muted-foreground">{subheading}</p>}
          </div>
          <Link href="/blog" className="inline-flex items-center font-medium hover:text-primary transition-colors">
            Read All Articles <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post: any) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col h-full bg-background border rounded-2xl overflow-hidden hover:shadow-lg transition-all">
              <div className="relative aspect-[16/9] bg-muted overflow-hidden">
                {post.thumbnail ? (
                  <img 
                    src={post.thumbnail} 
                    alt={post.title} 
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                )}
                {post.category && (
                  <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {post.category}
                  </div>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Calendar size={14} />
                  <span>
                    {post.publishDate 
                      ? new Date(post.publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                      : new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  {post.readTime && (
                    <>
                      <span>•</span>
                      <span>{post.readTime} min read</span>
                    </>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                  {post.excerpt || post.content?.replace(/<[^>]*>?/gm, '').substring(0, 120) + '...'}
                </p>
                <div className="text-sm font-semibold text-primary flex items-center mt-auto">
                  Read Article <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
          
          {posts.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
              No blog posts found. Add some in the CMS.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
