"use client";

import React, { useEffect, useRef, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UploadCloud, Search, Check, ImageOff, Loader2, FileVideo, File } from "lucide-react";

type Media = {
  id: string;
  filename: string;
  url: string;
  mimetype: string;
  size: number;
};

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  /** Called with the selected media's (app-relative) url. */
  onSelect: (url: string) => void;
  /** Only show media whose mimetype starts with one of these prefixes. */
  mimePrefixes?: string[];
  title?: string;
  description?: string;
}

const isImage = (m: Media) => m.mimetype?.startsWith("image/");

export default function MediaPicker({
  open,
  onClose,
  onSelect,
  mimePrefixes = ["image/"],
  title = "Select Media",
  description = "Choose an existing file from your media library, or upload a new one.",
}: MediaPickerProps) {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/media");
      setMediaList(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load media library");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setSelected(null);
      setQuery("");
      fetchMedia();
    }
  }, [open]);

  const uploadNew = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await apiClient.post("/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const media = res.data;
      // The backend deduplicates by content: if this asset already existed it
      // returns the original record instead of creating a copy.
      if (media.deduped) {
        toast.info("This file already exists in your library — selected it.");
      } else {
        toast.success("Uploaded to media library");
      }
      await fetchMedia();
      setSelected(media.url);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const confirm = () => {
    if (!selected) return;
    onSelect(selected);
    onClose();
  };

  const matchesMime = (m: Media) =>
    mimePrefixes.some((p) => m.mimetype?.startsWith(p));

  const filtered = mediaList
    .filter(matchesMime)
    .filter((m) =>
      query ? m.filename.toLowerCase().includes(query.toLowerCase()) : true,
    );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* Search + upload */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by filename..."
              className="pl-9"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : (
              <UploadCloud size={16} className="mr-2" />
            )}
            Upload New
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={mimePrefixes.map((p) => `${p}*`).join(",")}
            className="hidden"
            onChange={(e) =>
              e.target.files?.[0] && uploadNew(e.target.files[0])
            }
          />
        </div>

        {/* Grid */}
        <div className="max-h-[55vh] overflow-y-auto -mx-1 px-1">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <ImageOff size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                {query
                  ? "No media matches your search."
                  : "No media in your library yet. Upload one to get started."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filtered.map((media) => {
                const active = selected === media.url;
                return (
                  <button
                    type="button"
                    key={media.id}
                    onClick={() => setSelected(media.url)}
                    title={media.filename}
                    className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      active
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-transparent hover:border-muted-foreground/30"
                    }`}
                  >
                    {isImage(media) ? (
                      <img
                        src={media.url}
                        alt={media.filename}
                        className="w-full h-full object-contain bg-muted/40 p-1"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted/40 text-muted-foreground">
                        {media.mimetype?.startsWith("video/") ? (
                          <FileVideo size={28} />
                        ) : (
                          <File size={28} />
                        )}
                      </div>
                    )}
                    {active && (
                      <span className="absolute top-1 right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check size={12} />
                      </span>
                    )}
                    <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] truncate px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {media.filename}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={confirm} disabled={!selected}>
            Select
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
