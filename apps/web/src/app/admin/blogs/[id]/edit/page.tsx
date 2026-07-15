"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import TipTapEditor from "@/components/admin/tiptap-editor";
import TagInput from "@/components/admin/tag-input";
import SeoTab from "@/components/admin/seo-tab";
import MediaField from "@/components/admin/media-field";
import { CategorySelect } from "@/components/admin/category-select";
import { StatusControl, ContentStatus } from "@/components/admin/status-control";
import { StatusBadge } from "@/components/admin/status-badge";
import { toast } from "sonner";
import {
  ArrowLeft, Globe, FileText,
  Image as ImageIcon, Settings,
  Search, ChevronDown, X, Sparkles,
} from "lucide-react";

const schema = z.object({
  title: z.string().min(2, "Title required"),
  slug: z.string().min(2, "Slug required").regex(/^[a-z0-9-]+$/),
  excerpt: z.string().optional(),
  content: z.string().min(10, "Content required"),
  categoryIds: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  thumbnail: z.string().optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED"]),
  publishAt: z.string().nullable().optional(),
  publishDate: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  ogImage: z.string().optional(),
});

interface FormValues {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  categoryIds?: string[];
  tags?: string[];
  thumbnail?: string;
  status: ContentStatus;
  publishAt?: string | null;
  publishDate?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
}

export default function EditBlogPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [seoExpanded, setSeoExpanded] = useState(false);

  const { register, control, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { tags: [], categoryIds: [], status: "DRAFT" },
  });

  const thumbnail = watch("thumbnail");
  const statusWatch = watch("status");
  const publishAtWatch = watch("publishAt");
  const slugWatch = watch("slug");

  const seoVals = {
    metaTitle: watch("metaTitle") || "",
    metaDescription: watch("metaDescription") || "",
    metaKeywords: watch("metaKeywords") || "",
    ogImage: watch("ogImage") || "",
  };

  useEffect(() => {
    
    // Fetch blog post details
    apiClient.get(`/blogs/${id}`)
      .then(res => {
        const blog = res.data;
        let formattedDate = "";
        if (blog.publishDate) {
          formattedDate = new Date(blog.publishDate).toISOString().substring(0, 16);
        }
        
        reset({
          title: blog.title,
          slug: blog.slug,
          excerpt: blog.excerpt || "",
          content: blog.content,
          categoryIds: Array.isArray(blog.categories) ? blog.categories.map((c: any) => c.id) : [],
          tags: Array.isArray(blog.tags) ? blog.tags : [],
          thumbnail: blog.thumbnail || "",
          status: (blog.status as ContentStatus) || (blog.isPublished ? "PUBLISHED" : "DRAFT"),
          publishAt: blog.publishAt || null,
          publishDate: formattedDate,
          metaTitle: blog.metaTitle || "",
          metaDescription: blog.metaDescription || "",
          metaKeywords: blog.metaKeywords || "",
          ogImage: blog.ogImage || "",
        });
        setContent(blog.content);
        setLoading(false);
      })
      .catch(err => {
        toast.error("Failed to load blog post");
        router.push("/admin/blogs");
      });
  }, [id, reset, router]);

  const uploadThumbnail = async (file: File) => {
    const toastId = toast.loading("Uploading image...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiClient.post("/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setValue("thumbnail", res.data.url);
      toast.success("Image uploaded successfully", { id: toastId });
    } catch (err) {
      toast.error("Failed to upload image", { id: toastId });
    }
  };

  // Persist the post. The API derives `isPublished` from `status`, and a
  // SCHEDULED post with a past time publishes immediately.
  const persist = async (data: FormValues) => {
    const payload = {
      ...data,
      content,
      publishDate: data.publishDate ? new Date(data.publishDate).toISOString() : null,
      publishAt: data.status === "SCHEDULED" ? data.publishAt || null : null,
    };
    await apiClient.patch(`/blogs/${id}`, payload);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      await persist(data);
      toast.success("Blog post saved successfully!");
      router.push("/admin/blogs");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save blog post");
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin shadow-lg" />
          <p className="text-sm font-semibold tracking-wider uppercase text-muted-foreground animate-pulse">Loading Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 max-w-[1200px] mx-auto pb-16">
      
      {/* Sticky Premium Top Bar */}
      <div className="sticky top-0 z-30 flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 -mx-6 px-6 lg:-mx-8 lg:px-8 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={() => router.push("/admin/blogs")}
            className="p-2 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-all border border-muted/50 bg-background shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">Edit Post</h1>
              <StatusBadge status={statusWatch} publishAt={publishAtWatch} />
            </div>
            {slugWatch && (
              <p className="text-sm text-muted-foreground font-mono mt-1 truncate max-w-md opacity-80">
                /{slugWatch}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" type="button" onClick={() => router.push("/admin/blogs")} className="rounded-xl font-medium">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg shadow-primary/20 font-semibold hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            {isSubmitting ? "Saving..." : statusWatch === "SCHEDULED" ? "Schedule" : statusWatch === "PUBLISHED" ? "Publish" : "Save Draft"}
          </Button>
        </div>
      </div>

      {/* Main Studio Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start px-2">
        
        {/* LEFT COLUMN: Distraction-free Writing Canvas */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Title & Editor Canvas Card */}
          <div className="bg-card border border-muted-foreground/10 rounded-2xl p-6 md:p-10 shadow-xl shadow-muted/20 space-y-8 transition-all duration-300 focus-within:ring-1 focus-within:ring-primary/20">
            
            {/* Borderless Document Title */}
            <div className="space-y-2 pb-4 border-b border-muted-foreground/5">
              <input
                type="text"
                {...register("title")}
                placeholder="Enter an engaging title..."
                className="w-full text-4xl md:text-5xl font-black tracking-tighter bg-transparent border-0 focus:ring-0 outline-none transition-all placeholder:text-muted-foreground/30 text-foreground"
              />
              {errors.title && <p className="text-sm text-destructive font-medium">{errors.title.message}</p>}
            </div>

            {/* TipTap Rich Text Editor Container */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
                <Sparkles size={14} className="text-primary" /> Body Content
              </label>
              <div className="prose-container">
                <TipTapEditor
                  value={content}
                  onChange={(html) => { setContent(html); setValue("content", html); }}
                  placeholder="Start writing your amazing article..."
                />
              </div>
              {errors.content && <p className="text-sm text-destructive font-medium">{errors.content.message}</p>}
            </div>
          </div>

          {/* Excerpt Card */}
          <div className="bg-card/50 backdrop-blur-sm border border-muted-foreground/10 rounded-2xl p-6 shadow-lg shadow-muted/10 space-y-4 hover:bg-card transition-colors">
            <h3 className="font-bold text-sm flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
              <FileText size={16} className="text-primary" /> Short Excerpt
            </h3>
            <Textarea
              {...register("excerpt")}
              placeholder="Write a brief, engaging summary shown on cards and social listings..."
              rows={3}
              className="bg-background/50 focus:bg-background resize-none rounded-xl border-muted/50 focus:border-primary/50 text-base"
            />
            <p className="text-xs font-medium text-muted-foreground/80">
              Typically displayed on article search indexes. Keep it concise.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar Settings Panel */}
        <div className="lg:col-span-4 space-y-6">

          {/* Publishing Card */}
          <div className="bg-card border border-muted-foreground/10 rounded-2xl p-6 shadow-xl shadow-muted/20 space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-2 uppercase tracking-wider text-muted-foreground border-b border-muted-foreground/10 pb-4">
              <Globe size={16} className="text-primary" /> Publishing
            </h3>
            <StatusControl
              status={statusWatch}
              publishAt={publishAtWatch}
              onChange={(s, p) => {
                setValue("status", s, { shouldDirty: true });
                setValue("publishAt", p, { shouldDirty: true });
              }}
            />
          </div>

          {/* Settings & Metadata Card */}
          <div className="bg-card border border-muted-foreground/10 rounded-2xl p-6 shadow-xl shadow-muted/20 space-y-6">
            <h3 className="font-bold text-sm flex items-center gap-2 uppercase tracking-wider text-muted-foreground border-b border-muted-foreground/10 pb-4">
              <Settings size={16} className="text-primary" /> Configuration
            </h3>

            <div className="space-y-5">
              
              {/* Categories */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-foreground/70">Categories</label>
                <Controller
                  control={control}
                  name="categoryIds"
                  render={({ field }) => (
                    <CategorySelect value={field.value || []} onChange={field.onChange} by="id" />
                  )}
                />
              </div>

              {/* URL Slug */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-foreground/70">URL Slug</label>
                <Input 
                  {...register("slug")} 
                  placeholder="url-slug-format" 
                  className="bg-background/50 focus:bg-background rounded-xl h-11 font-mono text-sm border-muted/50 focus:border-primary/50"
                />
                {errors.slug && <p className="text-xs text-destructive font-medium">{errors.slug.message}</p>}
              </div>

              {/* Tags Selector */}
              <div className="space-y-2 pt-4 border-t border-muted-foreground/10">
                <Controller
                  control={control}
                  name="tags"
                  render={({ field }) => (
                    <TagInput 
                      value={field.value || []} 
                      onChange={field.onChange} 
                      placeholder="Add tags..." 
                      label="Post Tags"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Featured Image Thumbnail Card */}
          <div className="bg-card border border-muted-foreground/10 rounded-2xl p-6 shadow-xl shadow-muted/20 space-y-5">
            <h3 className="font-bold text-sm flex items-center gap-2 uppercase tracking-wider text-muted-foreground border-b border-muted-foreground/10 pb-4">
              <ImageIcon size={16} className="text-primary" /> Featured Image
            </h3>

            {thumbnail ? (
              <div className="relative aspect-video rounded-xl overflow-hidden group border border-muted bg-muted/20 shadow-inner">
                <img src={thumbnail} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={() => setValue("thumbnail", "")}
                    className="px-4 py-2 bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 transition-all shadow-xl hover:scale-105 text-sm flex items-center gap-2 font-bold"
                  >
                    <X size={16} /> Remove Image
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-8 text-center bg-muted/5 hover:border-primary/50 hover:bg-primary/5 transition-all relative overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <ImageIcon className="mx-auto mb-3 text-muted-foreground opacity-50 group-hover:scale-110 group-hover:text-primary transition-all duration-300" size={32} />
                <span className="text-sm font-bold block text-foreground/80 group-hover:text-foreground">Click or drag image</span>
                <span className="text-xs font-medium text-muted-foreground block mt-1.5">Supports PNG, JPG, WebP</span>
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={e => {
                    if (e.target.files?.[0]) uploadThumbnail(e.target.files[0]);
                  }}
                />
              </div>
            )}

            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Image URL / Media Library</label>
              <MediaField
                type="image"
                value={thumbnail || ""}
                onChange={(url) => setValue("thumbnail", url)}
                placeholder="Or paste external image URL..."
                showPreview={false}
              />
            </div>
          </div>

          {/* Collapsible SEO Accordion */}
          <div className="bg-card border border-muted-foreground/10 rounded-2xl shadow-xl shadow-muted/20 overflow-hidden transition-all duration-300">
            <button
              type="button"
              onClick={() => setSeoExpanded(!seoExpanded)}
              className="w-full px-6 py-5 flex items-center justify-between hover:bg-muted/30 transition-colors text-left"
            >
              <h3 className="font-bold text-sm flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                <Search size={16} className="text-primary" /> SEO Settings
              </h3>
              <div className={`p-1.5 rounded-full bg-muted/50 transition-transform duration-300 ${seoExpanded ? 'rotate-180 bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                <ChevronDown size={14} />
              </div>
            </button>
            {seoExpanded && (
              <div className="px-6 pb-6 pt-2 border-t border-muted-foreground/10 bg-card/40">
                <SeoTab values={seoVals} onChange={(field, value) => setValue(field as any, value)} />
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
