"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SeoTabProps {
  values: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    ogImage?: string;
  };
  onChange: (field: string, value: string) => void;
}

export default function SeoTab({ values, onChange }: SeoTabProps) {
  const titleLen = values.metaTitle?.length || 0;
  const descLen = values.metaDescription?.length || 0;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Meta Title</label>
          <span className={`text-xs ${titleLen > 60 ? "text-destructive" : "text-muted-foreground"}`}>
            {titleLen}/60
          </span>
        </div>
        <Input
          placeholder="Page title for search engines..."
          value={values.metaTitle || ""}
          onChange={e => onChange("metaTitle", e.target.value)}
        />
        <p className="text-xs text-muted-foreground">Optimal: 50–60 characters. Google truncates at 60.</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Meta Description</label>
          <span className={`text-xs ${descLen > 160 ? "text-destructive" : "text-muted-foreground"}`}>
            {descLen}/160
          </span>
        </div>
        <Textarea
          placeholder="Brief description for search engine results..."
          value={values.metaDescription || ""}
          onChange={e => onChange("metaDescription", e.target.value)}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">Optimal: 120–160 characters.</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Meta Keywords</label>
        <Input
          placeholder="keyword1, keyword2, keyword3..."
          value={values.metaKeywords || ""}
          onChange={e => onChange("metaKeywords", e.target.value)}
        />
        <p className="text-xs text-muted-foreground">Comma-separated keywords (optional, low SEO impact but useful).</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">OG Image URL</label>
        <Input
          placeholder="https://... (1200×630px recommended)"
          value={values.ogImage || ""}
          onChange={e => onChange("ogImage", e.target.value)}
        />
        {values.ogImage && (
          <div className="mt-2 rounded-lg overflow-hidden border max-w-sm">
            <img src={values.ogImage} alt="OG Preview" className="w-full object-cover" />
          </div>
        )}
        <p className="text-xs text-muted-foreground">Image shown when shared on social media. Recommended: 1200×630px.</p>
      </div>

      {/* Live preview panel */}
      {(values.metaTitle || values.metaDescription) && (
        <div className="p-4 border rounded-lg bg-muted/30 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Google Preview</p>
          <p className="text-[#1a0dab] dark:text-blue-400 text-lg font-medium leading-tight">
            {values.metaTitle || "Page Title"}
          </p>
          <p className="text-[#006621] dark:text-green-400 text-sm">hexapixora.com › page-slug</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {values.metaDescription || "Meta description will appear here..."}
          </p>
        </div>
      )}
    </div>
  );
}
