"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MediaField from "@/components/admin/media-field";
import { CategorySelect } from "@/components/admin/category-select";
import { PageHeader } from "@/components/admin/ui";
import {
  UploadCloud, Loader2, ArrowLeft, CheckCircle2, AlertCircle, MinusCircle,
  AlertTriangle, Image as ImageIcon, ListTree,
} from "lucide-react";

type PreviewPost = {
  file: string;
  ok: boolean;
  error?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categories: string[];
  tags: string[];
  thumbnail: string;
  ogImage: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  status: string;
  date: string;
  headings: { level: number; text: string }[];
  warnings: string[];
  willOverwrite: boolean;
  selected: boolean;
  faq?: { question: string; answer: string }[];
};

type CommitResult = {
  total: number;
  imported: number;
  updated: number;
  skipped: number;
  failed: number;
  results: { file: string; slug?: string; status: string; message?: string }[];
};

export default function BlogImportPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [parsing, setParsing] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [posts, setPosts] = useState<PreviewPost[] | null>(null);
  const [overwrite, setOverwrite] = useState(false);
  const [result, setResult] = useState<CommitResult | null>(null);

  // Bulk-apply controls
  const [bulkCategories, setBulkCategories] = useState<string[]>([]);
  const [bulkImage, setBulkImage] = useState("");

  const validPosts = posts?.filter((p) => p.ok) ?? [];
  const selectedPosts = posts?.filter((p) => p.ok && p.selected) ?? [];

  // ---- Step 1: parse ----
  const parse = async (fileList: FileList | null) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    setParsing(true);
    setResult(null);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      const res = await apiClient.post("/blogs/import/preview", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const parsed: PreviewPost[] = (res.data.posts || []).map((p: any) => ({ ...p, selected: !!p.ok }));
      setPosts(parsed);
      if (parsed.length === 0) toast.error("No .md files found in the upload.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not read the files.");
    } finally {
      setParsing(false);
    }
  };

  // ---- Bulk-apply helpers (mutate selected posts only) ----
  const applyToSelected = (fn: (p: PreviewPost) => PreviewPost) => {
    setPosts((prev) => prev?.map((p) => (p.ok && p.selected ? fn(p) : p)) ?? prev);
  };
  const applyCategory = () => {
    if (!bulkCategories.length) return;
    applyToSelected((p) => ({ ...p, categories: bulkCategories }));
    toast.success(`Categories applied to ${selectedPosts.length} post(s).`);
  };
  const setPostCategories = (i: number, names: string[]) =>
    setPosts((prev) => prev?.map((p, idx) => (idx === i ? { ...p, categories: names } : p)) ?? prev);
  const applyImage = (target: "thumbnail" | "ogImage" | "both") => {
    if (!bulkImage) return;
    applyToSelected((p) => ({
      ...p,
      ...(target !== "ogImage" ? { thumbnail: bulkImage } : {}),
      ...(target !== "thumbnail" ? { ogImage: bulkImage } : {}),
    }));
    toast.success(`Image applied to ${selectedPosts.length} post(s).`);
  };
  const setStatusAll = (status: "PUBLISHED" | "DRAFT") => {
    applyToSelected((p) => ({ ...p, status }));
  };
  const toggleAll = (val: boolean) => setPosts((prev) => prev?.map((p) => (p.ok ? { ...p, selected: val } : p)) ?? prev);
  const toggleOne = (i: number) => setPosts((prev) => prev?.map((p, idx) => (idx === i ? { ...p, selected: !p.selected } : p)) ?? prev);

  // ---- Step 3: commit ----
  const commit = async () => {
    if (selectedPosts.length === 0) return;
    setCommitting(true);
    try {
      const res = await apiClient.post("/blogs/import/commit", { posts: selectedPosts, overwrite });
      setResult(res.data);
      const d: CommitResult = res.data;
      toast.success(`Imported ${d.imported}${d.updated ? ` · updated ${d.updated}` : ""}${d.failed ? ` · ${d.failed} failed` : ""}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Import failed");
    } finally {
      setCommitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Import posts" description="Upload Markdown files or a .zip bundle, review, then import.">
        <Button variant="outline" onClick={() => router.push("/admin/blogs")}>
          <ArrowLeft size={16} className="mr-2" /> Back to Insights
        </Button>
      </PageHeader>

      {/* Result screen */}
      {result ? (
        <div className="space-y-4 rounded-2xl border bg-card p-6">
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium">
            <span className="text-emerald-500">{result.imported} imported</span>
            {result.updated > 0 && <span className="text-sky-500">{result.updated} updated</span>}
            {result.skipped > 0 && <span className="text-muted-foreground">{result.skipped} skipped</span>}
            {result.failed > 0 && <span className="text-destructive">{result.failed} failed</span>}
          </div>
          <div className="max-h-72 space-y-1.5 overflow-auto rounded-lg border p-3 text-xs">
            {result.results.map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <StatusIcon status={r.status} />
                <span className="min-w-0">
                  <span className="font-mono">{r.file}</span>
                  {r.message && <span className="text-muted-foreground"> — {r.message}</span>}
                </span>
              </div>
            ))}
          </div>
          <Button onClick={() => router.push("/admin/blogs")}>Done</Button>
        </div>
      ) : !posts ? (
        /* Upload screen */
        <div className="rounded-2xl border bg-card p-6">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={parsing}
            className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-muted/60 bg-muted/20 p-12 text-center transition-colors hover:border-primary/40 disabled:opacity-60"
          >
            {parsing ? <Loader2 className="h-9 w-9 animate-spin text-muted-foreground" /> : <UploadCloud className="h-9 w-9 text-muted-foreground" />}
            <span className="text-sm font-medium">{parsing ? "Reading files…" : "Choose .md files or a .zip bundle"}</span>
            <span className="text-xs text-muted-foreground">Multiple files supported. Nothing is saved until you confirm.</span>
          </button>
          <input ref={inputRef} type="file" accept=".md,.markdown,.zip" multiple hidden onChange={(e) => parse(e.target.files)} />
        </div>
      ) : (
        /* Preview + bulk-apply screen */
        <>
          {/* Bulk toolbar */}
          <div className="grid gap-4 rounded-2xl border bg-card p-5 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Apply categories to selected</label>
              <CategorySelect by="name" value={bulkCategories} onChange={setBulkCategories} />
              <Button variant="outline" size="sm" onClick={applyCategory} disabled={!bulkCategories.length || selectedPosts.length === 0}>
                Apply to selected
              </Button>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Apply image to selected</label>
              <MediaField type="image" value={bulkImage} onChange={setBulkImage} />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => applyImage("both")} disabled={!bulkImage || selectedPosts.length === 0}>Featured + OG</Button>
                <Button size="sm" variant="outline" onClick={() => applyImage("thumbnail")} disabled={!bulkImage || selectedPosts.length === 0}>Featured only</Button>
                <Button size="sm" variant="outline" onClick={() => applyImage("ogImage")} disabled={!bulkImage || selectedPosts.length === 0}>OG only</Button>
              </div>
            </div>
          </div>

          {/* Action bar */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card px-4 py-3 text-sm">
            <span className="font-medium">{selectedPosts.length} of {validPosts.length} selected</span>
            <button className="text-muted-foreground hover:text-foreground" onClick={() => toggleAll(true)}>Select all</button>
            <button className="text-muted-foreground hover:text-foreground" onClick={() => toggleAll(false)}>None</button>
            <span className="mx-1 h-4 w-px bg-border" />
            <button className="text-muted-foreground hover:text-foreground" onClick={() => setStatusAll("PUBLISHED")}>Set all Published</button>
            <button className="text-muted-foreground hover:text-foreground" onClick={() => setStatusAll("DRAFT")}>Set all Draft</button>
            <span className="mx-1 h-4 w-px bg-border" />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={overwrite} onChange={(e) => setOverwrite(e.target.checked)} />
              Overwrite existing (same slug)
            </label>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" onClick={() => { setPosts(null); }}>Start over</Button>
              <Button onClick={commit} disabled={committing || selectedPosts.length === 0}>
                {committing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing…</> : `Import ${selectedPosts.length} post(s)`}
              </Button>
            </div>
          </div>

          {/* Preview table */}
          <div className="overflow-x-auto rounded-2xl border bg-card">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="border-b bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="w-10 p-3"></th>
                  <th className="p-3">Post</th>
                  <th className="p-3">Categories</th>
                  <th className="p-3">Images</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {posts.map((p, i) => (
                  <tr key={i} className={p.ok ? "" : "bg-destructive/5"}>
                    <td className="p-3 align-top">
                      <input type="checkbox" disabled={!p.ok} checked={p.ok && p.selected} onChange={() => toggleOne(i)} />
                    </td>
                    <td className="p-3 align-top">
                      <div className="font-medium leading-tight">{p.title || <span className="text-muted-foreground">— {p.file}</span>}</div>
                      {p.slug && <div className="text-xs text-muted-foreground">/{p.slug}</div>}
                      {p.headings.length > 0 && (
                        <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground" title={p.headings.map((h) => `${"#".repeat(h.level)} ${h.text}`).join("\n")}>
                          <ListTree size={12} /> {p.headings.length} heading{p.headings.length === 1 ? "" : "s"}
                        </div>
                      )}
                    </td>
                    <td className="min-w-[240px] p-3 align-top">
                      {p.ok ? (
                        <CategorySelect by="name" value={p.categories} onChange={(names) => setPostCategories(i, names)} />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-3 align-top">
                      <div className="flex gap-1.5">
                        <Thumb url={p.thumbnail} label="Featured" />
                        <Thumb url={p.ogImage} label="OG" />
                      </div>
                    </td>
                    <td className="p-3 align-top">
                      <Badge variant={p.status === "PUBLISHED" ? "default" : "secondary"}>{p.status}</Badge>
                    </td>
                    <td className="p-3 align-top">
                      <div className="flex flex-col gap-1 text-xs">
                        {p.error && <span className="inline-flex items-center gap-1 text-destructive"><AlertCircle size={12} /> {p.error}</span>}
                        {p.willOverwrite && <span className="inline-flex items-center gap-1 text-amber-500"><AlertTriangle size={12} /> Will overwrite existing</span>}
                        {p.warnings.map((w, wi) => <span key={wi} className="text-muted-foreground">• {w}</span>)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function Thumb({ url, label }: { url: string; label: string }) {
  if (!url) {
    return (
      <span className="flex h-9 w-9 items-center justify-center rounded border border-dashed border-muted-foreground/30 text-muted-foreground/50" title={`No ${label} image`}>
        <ImageIcon size={13} />
      </span>
    );
  }
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className="block h-9 w-9 rounded border bg-cover bg-center"
      style={{ backgroundImage: `url("${url.replace(/["\\<>]/g, "")}")` }}
    />
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "imported") return <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />;
  if (status === "updated") return <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-sky-500" />;
  if (status === "skipped") return <MinusCircle size={14} className="mt-0.5 shrink-0 text-muted-foreground" />;
  return <AlertCircle size={14} className="mt-0.5 shrink-0 text-destructive" />;
}
