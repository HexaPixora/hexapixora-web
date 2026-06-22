"use client";

import React, { useEffect, useRef, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { absoluteMediaUrl } from "@/lib/site-url";
import { useHasPermission } from "@/stores/use-auth-store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Upload, Copy, Check, Trash2, Image as ImageIcon, File } from "lucide-react";
import { useConfirm } from "@/components/admin/confirm-dialog";
import { PageHeader, EmptyState } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

export default function AdminMediaPage() {
  const canManage = useHasPermission("media");
  const confirm = useConfirm();
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "image" | "document">("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    try {
      const res = await apiClient.get("/media");
      setMediaList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchMedia(); }, []);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append("file", file);
    try {
      await apiClient.post("/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
      await fetchMedia();
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(uploadFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(absoluteMediaUrl(url));
    setCopied(url);
    toast.success("URL copied to clipboard");
    setTimeout(() => setCopied(null), 2000);
  };

  const deleteMedia = async (media: any) => {
    const ok = await confirm({
      title: "Delete media file?",
      description: `"${media.filename}" will be permanently deleted. This cannot be undone.`,
      confirmText: "Delete",
      destructive: true,
    });
    if (!ok) return;
    try {
      await apiClient.delete(`/media/${media.id}`);
      setMediaList((list) => list.filter((m) => m.id !== media.id));
      toast.success("Media deleted");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  const isImage = (m: any) => m.mimetype?.startsWith("image/");
  const filtered = mediaList.filter(m => {
    if (filter === "image") return isImage(m);
    if (filter === "document") return !isImage(m);
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Media Library" description={`${mediaList.length} files stored`}>
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          <Upload size={16} className="mr-2" /> Upload Files
        </Button>
      </PageHeader>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(["all", "image", "document"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70",
            )}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragging ? "border-primary bg-primary/10 scale-[1.01]" : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30"}`}
      >
        <Upload className="mx-auto mb-3 text-muted-foreground" size={32} />
        <p className="font-medium">Drag & drop files here, or click to browse</p>
        <p className="text-sm text-muted-foreground mt-1">Supports images, PDFs, and documents up to 10MB</p>
        {uploading && (
          <div className="mt-4 max-w-xs mx-auto">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Uploading... {uploadProgress}%</p>
          </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />

      {/* Media Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed">
          <EmptyState icon={ImageIcon} title="No media found" hint="Upload an image or document to get started." />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map(media => (
            <div key={media.id} className="group relative border rounded-xl overflow-hidden bg-muted/30 hover:shadow-lg transition-all">
              {isImage(media) ? (
                <img
                  src={media.url}
                  alt={media.filename}
                  className="w-full aspect-square object-cover"
                />
              ) : (
                <div className="w-full aspect-square flex items-center justify-center">
                  <File size={40} className="text-muted-foreground" />
                </div>
              )}

              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => copyUrl(media.url)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm text-white transition-colors"
                  title="Copy URL"
                >
                  {copied === media.url ? <Check size={16} /> : <Copy size={16} />}
                </button>
                {canManage && (
                  <button
                    onClick={() => deleteMedia(media)}
                    className="rounded-lg bg-destructive/80 p-2 text-white transition-colors hover:bg-destructive"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {/* Filename */}
              <div className="p-2">
                <p className="text-xs text-muted-foreground truncate">{media.filename}</p>
                <p className="text-xs text-muted-foreground">{(media.size / 1024).toFixed(0)} KB</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
