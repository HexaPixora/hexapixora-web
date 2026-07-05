import React from "react";
import SiteLayout from "@/components/public/site-layout";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, BookOpen, User } from "lucide-react";
import { Metadata } from "next";
import { apiUrl } from "@/lib/api-url";
import { cmsFetch } from "@/lib/cms-fetch";
import { siteUrl, absoluteMediaUrl } from "@/lib/site-url";
import { JsonLd } from "@/components/seo/json-ld";

async function getBlogPost(slug: string) {
  try {
    // cmsFetch unlocks unpublished posts when the admin is in Draft Mode.
    const res = await cmsFetch(`/blogs/slug/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

async function getRelatedBlogs(slug: string) {
  try {
    // Posts sharing a category with this one (falls back to recent server-side).
    const res = await fetch(apiUrl(`/blogs/slug/${slug}/related?limit=3`), { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    return [];
  }
}

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: BlogPostPageProps): Promise<Metadata> {
  const params = await props.params;
  const post = await getBlogPost(params.slug);
  if (!post) return { title: "Article Not Found | HexaPixora" };
  
  const canonical = `/blog/${post.slug}`;
  const ogDesc = post.metaDescription || post.excerpt || undefined;
  // Blog images must be absolutized too (this was emitting a raw relative URL).
  const rawImage = post.ogImage || post.thumbnail;
  const ogImage = rawImage ? absoluteMediaUrl(rawImage) : undefined;

  const base = {
    title: `${post.metaTitle || post.title} | HexaPixora Blog`,
    description: post.metaDescription || post.excerpt || `Read our latest article: ${post.title}`,
    keywords: post.metaKeywords || undefined,
    alternates: { canonical },
  };

  // Own image → full article OG/Twitter block; otherwise inherit layout default.
  if (!ogImage) return base;
  return {
    ...base,
    openGraph: {
      type: "article",
      title: post.title,
      description: ogDesc,
      url: siteUrl(canonical),
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: ogDesc,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage(props: BlogPostPageProps) {
  const params = await props.params;
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedBlogs(params.slug);

  const canonical = siteUrl(`/blog/${post.slug}`);
  const image = post.ogImage || post.thumbnail;
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || undefined,
    image: image ? absoluteMediaUrl(image) : undefined,
    datePublished: post.publishDate || post.createdAt || undefined,
    dateModified: post.updatedAt || post.publishDate || post.createdAt || undefined,
    ...(post.categories?.[0]?.name ? { articleSection: post.categories[0].name } : {}),
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    publisher: { "@type": "Organization", name: "HexaPixora" },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Blog", item: siteUrl("/blog") },
      { "@type": "ListItem", position: 3, name: post.title, item: canonical },
    ],
  };

  return (
    <SiteLayout showHeader={true} showFooter={true}>
      <JsonLd data={articleLd} />
      <JsonLd data={breadcrumbLd} />
      <article className="flex-1 bg-background relative overflow-hidden pb-24">
        {/* Top Gradient background */}
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/5 via-primary/0 to-transparent pointer-events-none" />

        <div className="container max-w-4xl pt-8 md:pt-16 relative z-10">
          {/* Back button */}
          <Link
            href="/blog"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group"
          >
            <ArrowLeft className="mr-1.5 w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Articles
          </Link>

          {/* Article Header */}
          <div className="space-y-6">
            {Array.isArray(post.categories) && post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.categories.map((c: any) => (
                  <Link
                    key={c.id}
                    href={`/category/${c.slug}`}
                    className="inline-block bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider hover:bg-primary/20 transition-colors"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
            
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-foreground">
              {post.title}
            </h1>

            {/* Author / Date info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-y py-4 border-muted/20">
              <div className="flex items-center gap-1.5">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
                  <User size={12} />
                </div>
                <span className="font-medium">HexaPixora Team</span>
              </div>
              <span className="hidden sm:inline text-muted-foreground/35">•</span>
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>
                  {new Date(post.publishDate || post.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              {post.readTime && (
                <>
                  <span className="hidden sm:inline text-muted-foreground/35">•</span>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{post.readTime} min read</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Featured Image */}
          {post.thumbnail && (
            <div className="my-10 aspect-[21/9] rounded-3xl overflow-hidden border border-muted/30 shadow-xl bg-muted">
              <img
                src={post.thumbnail}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="my-12 prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-a:text-primary hover:prose-a:underline">
            <div 
              dangerouslySetInnerHTML={{ __html: post.content }} 
              className="text-foreground/90 leading-relaxed text-lg space-y-6 break-words"
            />
          </div>

          {/* Tags */}
          {Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-6 border-t border-muted/20">
              {post.tags.map((tag: string) => (
                <span key={tag} className="text-xs font-semibold px-2.5 py-1 bg-muted text-muted-foreground rounded-md">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Recent Articles Section */}
        {relatedPosts.length > 0 && (
          <div className="border-t border-muted/20 bg-muted/10 mt-20 py-20">
            <div className="container max-w-6xl">
              <h2 className="text-2xl font-bold tracking-tight mb-10 flex items-center gap-2">
                <BookOpen size={20} className="text-primary" />
                <span>Continue Reading</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((recent: any) => (
                  <Link
                    key={recent.id}
                    href={`/blog/${recent.slug}`}
                    className="group bg-card border border-muted/30 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                  >
                    <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                      {recent.thumbnail ? (
                        <img
                          src={recent.thumbnail}
                          alt={recent.title}
                          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(recent.publishDate || recent.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">
                          {recent.title}
                        </h3>
                      </div>
                      <div className="text-xs font-semibold text-primary flex items-center pt-4 mt-auto border-t border-muted/20">
                        Read Article
                        <ArrowLeft className="ml-1 w-3.5 h-3.5 rotate-180 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </article>
    </SiteLayout>
  );
}
