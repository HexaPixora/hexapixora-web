"use client";

import React, { useEffect, useRef, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { absoluteMediaUrl } from "@/lib/site-url";
import { useHasPermission } from "@/stores/use-auth-store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Upload,
  Copy,
  Check,
  Trash2,
  Image as ImageIcon,
  Film,
  FileText,
  Search,
  Pencil,
  X,
  ExternalLink,
} from "lucide-react";
import { useConfirm } from "@/components/admin/confirm-dialog";
import { PageHeader, EmptyState } from "@/components/admin/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type MediaItem = {
  id: string;
  filename: string;
  name?: string | null;
  url: string;
  mimetype: string;
  size: number;
  folder?: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function AdminMediaPage() {
  const canManage = useHasPermission("media");
  const confirm = useConfirm();
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  
  // Filtering and Searching
  const [filter, setFilter] = useState<"all" | "images" | "videos" | "others">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Renaming modal state
  const [renamingItem, setRenamingItem] = useState<MediaItem | null>(null);
  const [newName, setNewName] = useState("");
  const [savingRename, setSavingRename] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    try {
      const res = await apiClient.get("/media");
      setMediaList(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load media");
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await apiClient.post("/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
      if (res.data?.deduped) {
        toast.info(`"${file.name}" already exists in your library.`);
      } else {
        toast.success(`Uploaded "${file.name}"`);
      }
      await fetchMedia();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Upload failed");
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

  const deleteMedia = async (media: MediaItem) => {
    const displayName = media.name || media.filename;
    const ok = await confirm({
      title: "Delete media file?",
      description: `"${displayName}" will be permanently deleted. This cannot be undone.`,
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

  const openRenameModal = (media: MediaItem) => {
    setRenamingItem(media);
    setNewName(media.name || media.filename);
  };

  const saveRename = async () => {
    if (!renamingItem) return;
    const trimmed = newName.trim();
    if (!trimmed) {
      toast.error("Please enter a valid name");
      return;
    }
    setSavingRename(true);
    try {
      const res = await apiClient.patch(`/media/${renamingItem.id}`, { name: trimmed });
      setMediaList((prev) =>
        prev.map((item) => (item.id === renamingItem.id ? { ...item, name: res.data.name } : item))
      );
      toast.success("Media renamed successfully");
      setRenamingItem(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to rename media");
    } finally {
      setSavingRename(false);
    }
  };

  const isImage = (m: MediaItem) => m.mimetype?.startsWith("image/");
  const isVideo = (m: MediaItem) => m.mimetype?.startsWith("video/");
  const isOther = (m: MediaItem) => !isImage(m) && !isVideo(m);

  const filtered = mediaList.filter((m) => {
    // Filter by type
    if (filter === "images" && !isImage(m)) return false;
    if (filter === "videos" && !isVideo(m)) return false;
    if (filter === "others" && !isOther(m)) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = m.name?.toLowerCase().includes(q);
      const matchFilename = m.filename.toLowerCase().includes(q);
      return Boolean(matchName || matchFilename);
    }
    return true;
  });

  const counts = {
    all: mediaList.length,
    images: mediaList.filter(isImage).length,
    videos: mediaList.filter(isVideo).length,
    others: mediaList.filter(isOther).length,
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Media Library" description={`${mediaList.length} files stored`}>
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          <Upload size={16} className="mr-2" /> Upload Files
        </Button>
      </PageHeader>

      {/* Search and Category Filter Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Tabs: All, Images, Videos, Others */}
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { key: "all", label: "All", count: counts.all },
              { key: "images", label: "Images", count: counts.images },
              { key: "videos", label: "Videos", count: counts.videos },
              { key: "others", label: "Others", count: counts.others },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                filter === t.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              <span>{t.label}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[11px] font-semibold",
                  filter === t.key ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted-foreground/15 text-muted-foreground"
                )}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or file..."
            className="pl-9 pr-8"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${
          dragging
            ? "scale-[1.01] border-primary bg-primary/10"
            : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30"
        }`}
      >
        <Upload className="mx-auto mb-3 text-muted-foreground" size={32} />
        <p className="font-medium">Drag &amp; drop files here, or click to browse</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Supports Images, Videos (MP4, WebM, MOV), and Documents up to 50MB
        </p>
        {uploading && (
          <div className="mx-auto mt-4 max-w-xs">
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Uploading... {uploadProgress}%</p>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Media Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed p-6">
          <EmptyState
            icon={ImageIcon}
            title={searchQuery ? "No matching media found" : "No media in this category"}
            hint={
              searchQuery
                ? `No files match "${searchQuery}". Clear your search query or upload new files.`
                : "Upload an image, video, or document to get started."
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((media) => {
            const displayName = media.name || media.filename;
            return (
              <div
                key={media.id}
                className="group relative flex flex-col overflow-hidden rounded-xl border bg-card/60 transition-all hover:border-primary/40 hover:shadow-lg"
              >
                {/* Media Preview Box */}
                <div className="relative aspect-square w-full overflow-hidden bg-muted/40">
                  {isImage(media) ? (
                    <img
                      src={media.url}
                      alt={displayName}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : isVideo(media) ? (
                    <div className="relative flex h-full w-full items-center justify-center bg-slate-950">
                      <video
                        src={media.url}
                        className="h-full w-full object-cover opacity-80"
                        preload="metadata"
                        muted
                      />
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-sm">
                          <Film size={20} />
                        </div>
                      </div>
                      <span className="absolute left-2 top-2 rounded bg-indigo-600/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                        VIDEO
                      </span>
                    </div>
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center p-3 text-muted-foreground">
                      <FileText size={36} className="mb-2 text-muted-foreground/70" />
                      <span className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase">
                        {media.filename.split(".").pop() || "FILE"}
                      </span>
                    </div>
                  )}

                  {/* Hover Actions Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/65 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => openRenameModal(media)}
                      className="rounded-lg bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                      title="Rename"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => copyUrl(media.url)}
                      className="rounded-lg bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                      title="Copy URL"
                    >
                      {copied === media.url ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                    </button>
                    <a
                      href={absoluteMediaUrl(media.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                      title="Open in new tab"
                    >
                      <ExternalLink size={15} />
                    </a>
                    {canManage && (
                      <button
                        onClick={() => deleteMedia(media)}
                        className="rounded-lg bg-destructive/80 p-2 text-white transition-colors hover:bg-destructive"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Info & Rename Footer */}
                <div className="flex flex-col justify-between gap-1 p-2.5">
                  <div className="flex items-start justify-between gap-1">
                    <p className="truncate text-xs font-semibold text-foreground" title={displayName}>
                      {displayName}
                    </p>
                    <button
                      onClick={() => openRenameModal(media)}
                      className="opacity-60 transition-opacity hover:opacity-100 hover:text-primary"
                      title="Rename"
                    >
                      <Pencil size={12} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="truncate opacity-80" title={media.filename}>
                      {media.filename}
                    </span>
                    <span className="shrink-0 font-mono">{(media.size / 1024).toFixed(0)} KB</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rename Dialog */}
      <Dialog open={Boolean(renamingItem)} onOpenChange={(o) => !o && setRenamingItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Media</DialogTitle>
            <DialogDescription>
              Set a friendly title/name for this media file. This name will appear in your CMS library and search.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="media-rename-input" className="text-sm font-medium">
                Media Name
              </label>
              <Input
                id="media-rename-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Hero Banner 2026"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    saveRename();
                  }
                }}
              />
            </div>

            {renamingItem && (
              <div className="rounded-lg border bg-muted/30 p-2.5 text-xs text-muted-foreground space-y-1">
                <p className="truncate">
                  <strong className="text-foreground">Stored File:</strong> {renamingItem.filename}
                </p>
                <p>
                  <strong className="text-foreground">Type:</strong> {renamingItem.mimetype} ({(renamingItem.size / 1024).toFixed(0)} KB)
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRenamingItem(null)} disabled={savingRename}>
              Cancel
            </Button>
            <Button onClick={saveRename} disabled={savingRename || !newName.trim()}>
              {savingRename ? "Saving..." : "Save Name"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
