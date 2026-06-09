"use client";

import React, { useEffect, useRef, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Upload, X, Copy, Check, Trash2, Image as ImageIcon, File } from "lucide-react";

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "image" | "document">("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
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
      alert("Upload failed");
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
    const absoluteUrl = typeof window !== "undefined" ? window.location.origin + url : url;
    navigator.clipboard.writeText(absoluteUrl);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  const deleteMedia = async (id: string) => {
    try {
      await apiClient.delete(`/media/${id}`);
      setMediaList(mediaList.filter(m => m.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      alert("Delete failed");
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Media Library</h1>
          <p className="text-muted-foreground">{mediaList.length} files stored</p>
        </div>
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          <Upload size={16} className="mr-2" /> Upload Files
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "image", "document"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
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
        <div className="text-center py-20 text-muted-foreground">
          <ImageIcon size={48} className="mx-auto mb-4 opacity-30" />
          <p>No media found. Upload your first file!</p>
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
                <button
                  onClick={() => setDeleteConfirm(media.id)}
                  className="p-2 bg-destructive/80 hover:bg-destructive rounded-lg text-white transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-background border rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-semibold text-lg mb-2">Delete Media File</h3>
            <p className="text-muted-foreground text-sm mb-4">This will permanently delete the file. This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteMedia(deleteConfirm)}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
