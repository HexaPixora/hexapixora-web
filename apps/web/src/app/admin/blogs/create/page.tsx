"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { 
  ArrowLeft, Save, Globe, Eye, FileText, 
  Image as ImageIcon, Settings, Calendar, 
  Search, ChevronDown, X, Sparkles, CheckCircle2 
} from "lucide-react";

const schema = z.object({
  title: z.string().min(2, "Title required"),
  slug: z.string().min(2, "Slug required").regex(/^[a-z0-9-]+$/),
  excerpt: z.string().optional(),
  content: z.string().min(10, "Content required"),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  thumbnail: z.string().optional(),
  isPublished: z.boolean().default(false),
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
  category?: string;
  tags?: string[];
  thumbnail?: string;
  isPublished?: boolean;
  publishDate?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
}

export default function CreateBlogPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [seoExpanded, setSeoExpanded] = useState(false);

  const { register, control, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { tags: [], isPublished: false },
  });

  const title = watch("title");
  const thumbnail = watch("thumbnail");
  const isPublishedWatch = watch("isPublished");
  const slugWatch = watch("slug");

  const seoVals = {
    metaTitle: watch("metaTitle") || "",
    metaDescription: watch("metaDescription") || "",
    metaKeywords: watch("metaKeywords") || "",
    ogImage: watch("ogImage") || "",
  };

  useEffect(() => {
    if (title) {
      setValue("slug", title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  }, [title, setValue]);

  useEffect(() => {
    apiClient.get("/blogs/categories").then(res => setCategories(res.data || [])).catch(() => {});
  }, []);

  const uploadThumbnail = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post("/media/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setValue("thumbnail", res.data.url);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        ...data,
        content,
        publishDate: data.publishDate ? new Date(data.publishDate).toISOString() : null,
      };
      await apiClient.post("/blogs", payload);
      router.push("/admin/blogs");
    } catch (err: any) {
      alert(err.response?.data?.message || "Save failed");
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-16">
      
      {/* Sticky Premium Top Bar */}
      <div className="sticky top-[56px] z-20 flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 -mx-6 px-6">
        <div className="flex items-center gap-3.5">
          <button 
            type="button"
            onClick={() => router.push("/admin/blogs")}
            className="p-2 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-all border border-muted/50 bg-background/50 shadow-sm"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">Create Blog Post</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                isPublishedWatch 
                  ? "bg-green-500/10 text-green-500 border-green-500/20" 
                  : "bg-amber-500/10 text-amber-500 border-amber-500/20"
              }`}>
                {isPublishedWatch ? "Published" : "Draft"}
              </span>
            </div>
            {slugWatch && (
              <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate max-w-md">
                /{slugWatch}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="ghost" type="button" onClick={() => router.push("/admin/blogs")} className="rounded-xl">
            Cancel
          </Button>

          <Button
            variant="outline"
            type="button"
            onClick={() => {
              setValue("isPublished", false);
              handleSubmit(onSubmit)();
            }}
            disabled={isSubmitting}
            className="rounded-xl border-muted-foreground/20"
          >
            {isSubmitting ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            type="button"
            onClick={() => {
              setValue("isPublished", true);
              handleSubmit(onSubmit)();
            }}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md shadow-green-500/10"
          >
            {isSubmitting ? "Publishing..." : "Publish Post"}
          </Button>
        </div>
      </div>

      {/* Main Studio Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Distraction-free Writing Canvas */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Title & Editor Canvas Card */}
          <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            
            {/* Borderless Document Title */}
            <div className="space-y-1.5 pb-2">
              <input
                type="text"
                {...register("title")}
                placeholder="Enter post title..."
                className="w-full text-3xl md:text-4xl font-extrabold tracking-tight bg-transparent border-0 border-b border-transparent hover:border-muted-foreground/20 focus:border-primary focus:ring-0 outline-none transition-all placeholder:text-muted-foreground/30 pb-2.5"
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            {/* TipTap Rich Text Editor Container */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
                <Sparkles size={13} className="text-primary" /> Body Content
              </label>
              <TipTapEditor
                value={content}
                onChange={(html) => { setContent(html); setValue("content", html); }}
                placeholder="Start writing your article body..."
              />
              {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
            </div>
          </div>

          {/* Excerpt Card */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <FileText size={16} className="text-primary" /> Short Excerpt
            </h3>
            <Textarea
              {...register("excerpt")}
              placeholder="Write a brief, engaging summary shown on cards and social listings..."
              rows={3}
              className="bg-background resize-none rounded-xl"
            />
            <p className="text-[11px] text-muted-foreground">
              Typically displayed on article search indexes. Keep it concise.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar Settings Panel */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Settings & Metadata Card */}
          <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-5">
            <h3 className="font-semibold text-sm flex items-center gap-2 border-b pb-2">
              <Settings size={16} className="text-primary" /> Configuration
            </h3>

            <div className="space-y-4">
              
              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">Category</label>
                <Input 
                  {...register("category")} 
                  placeholder="e.g. Marketing, Tech..." 
                  list="cat-list"
                  className="bg-background rounded-xl h-10"
                />
                <datalist id="cat-list">
                  {categories.map(c => <option key={c} value={c || ""} />)}
                </datalist>
              </div>

              {/* URL Slug */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">URL Slug</label>
                <Input 
                  {...register("slug")} 
                  placeholder="url-slug-format" 
                  className="bg-background rounded-xl h-10 font-mono text-xs"
                />
                {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
              </div>

              {/* Publish Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                  <Calendar size={13} className="text-muted-foreground" /> Publish Date
                </label>
                <Input 
                  type="datetime-local" 
                  {...register("publishDate")} 
                  className="bg-background rounded-xl h-10 text-sm"
                />
              </div>

              {/* Tags Selector */}
              <div className="space-y-1.5 pt-3 border-t">
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
          <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2 border-b pb-2">
              <ImageIcon size={16} className="text-primary" /> Featured Image
            </h3>

            {thumbnail ? (
              <div className="relative aspect-video rounded-xl overflow-hidden group border bg-muted/20 shadow-inner">
                <img src={thumbnail} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setValue("thumbnail", "")}
                    className="px-3 py-2 bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 transition-colors shadow-md text-xs flex items-center gap-1.5 font-medium"
                  >
                    <X size={13} /> Remove Image
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-muted-foreground/30 rounded-xl p-6 text-center bg-muted/10 hover:border-primary/50 hover:bg-muted/20 transition-all relative overflow-hidden group cursor-pointer">
                <ImageIcon className="mx-auto mb-2 text-muted-foreground opacity-60 group-hover:scale-105 transition-transform" size={26} />
                <span className="text-xs font-medium block">Click or drag image to upload</span>
                <span className="text-[10px] text-muted-foreground block mt-1">Supports PNG, JPG, WebP</span>
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

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Image URL Fallback</label>
              <Input
                placeholder="Or paste external image URL..."
                value={thumbnail || ""}
                onChange={e => setValue("thumbnail", e.target.value)}
                className="h-9 text-xs bg-background rounded-xl"
              />
            </div>
          </div>

          {/* Collapsible SEO Accordion */}
          <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setSeoExpanded(!seoExpanded)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/10 transition-colors text-left"
            >
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Search size={16} className="text-primary" /> SEO Settings
              </h3>
              <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-300 ${seoExpanded ? 'rotate-180' : ''}`} />
            </button>
            {seoExpanded && (
              <div className="px-5 pb-5 pt-2 border-t bg-card/40">
                <SeoTab values={seoVals} onChange={(field, value) => setValue(field as any, value)} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
