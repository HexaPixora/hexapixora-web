"use client";

import React, { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MediaPicker from "./media-picker";
import { UploadCloud, ImagePlus, Loader2 } from "lucide-react";

interface MediaFieldProps {
  type?: "image" | "video";
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  /** Show the free-text URL input (lets users paste an external URL). */
  showUrlInput?: boolean;
  /** Show the inline thumbnail preview for images. */
  showPreview?: boolean;
  className?: string;
}

/**
 * Unified media control: paste a URL, upload a new file, or pick an existing
 * one from the media library. Uploads are deduplicated server-side, so picking
 * a file that was uploaded before reuses the same asset.
 */
export default function MediaField({
  type = "image",
  value,
  onChange,
  placeholder,
  showUrlInput = true,
  showPreview = true,
  className,
}: MediaFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const mimePrefix = type === "video" ? "video/" : "image/";

  const upload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await apiClient.post("/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onChange(res.data.url);
      if (res.data.deduped) {
        toast.info("This file already existed in your library — reused it.");
      } else {
        toast.success("Uploaded to media library");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        {showUrlInput && (
          <Input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder ?? `URL or upload ${type}...`}
            className="flex-1 text-sm"
          />
        )}

        <label className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-3">
          {uploading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <UploadCloud size={16} />
          )}
          <span className="ml-2 hidden sm:inline">Upload</span>
          <input
            type="file"
            accept={`${mimePrefix}*`}
            className="hidden"
            disabled={uploading}
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          />
        </label>

        <Button
          type="button"
          variant="secondary"
          className="h-10 px-3"
          onClick={() => setPickerOpen(true)}
        >
          <ImagePlus size={16} />
          <span className="ml-2 hidden sm:inline">Select</span>
        </Button>

        {showPreview && value && type === "image" && (
          <img
            src={value}
            alt="Preview"
            className="h-10 w-10 object-cover rounded border shrink-0"
          />
        )}
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={onChange}
        mimePrefixes={[mimePrefix]}
        title={`Select ${type === "video" ? "Video" : "Image"}`}
      />
    </div>
  );
}
