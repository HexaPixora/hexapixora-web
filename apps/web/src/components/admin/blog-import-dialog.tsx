"use client";

import React, { useRef, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { UploadCloud, Loader2, FileText, CheckCircle2, MinusCircle, AlertCircle } from "lucide-react";

type RowStatus = "imported" | "updated" | "skipped" | "failed";
type ImportResult = {
  total: number;
  imported: number;
  updated: number;
  skipped: number;
  failed: number;
  results: { file: string; status: RowStatus; slug?: string; message?: string }[];
};

const STATUS_UI: Record<RowStatus, { icon: React.ReactNode; color: string }> = {
  imported: { icon: <CheckCircle2 size={14} />, color: "text-emerald-500" },
  updated: { icon: <CheckCircle2 size={14} />, color: "text-sky-500" },
  skipped: { icon: <MinusCircle size={14} />, color: "text-muted-foreground" },
  failed: { icon: <AlertCircle size={14} />, color: "text-destructive" },
};

export function BlogImportDialog({
  open,
  onClose,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [publish, setPublish] = useState(false);
  const [overwrite, setOverwrite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFiles([]);
    setResult(null);
    setPublish(false);
    setOverwrite(false);
  };

  const close = () => {
    onClose();
    reset();
  };

  const submit = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setResult(null);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      fd.append("publish", String(publish));
      fd.append("overwrite", String(overwrite));
      const res = await apiClient.post("/blogs/import", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data: ImportResult = res.data;
      setResult(data);
      toast.success(
        `Imported ${data.imported}` +
          (data.updated ? ` · updated ${data.updated}` : "") +
          (data.skipped ? ` · skipped ${data.skipped}` : "") +
          (data.failed ? ` · ${data.failed} failed` : ""),
      );
      onDone();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) close(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import posts from Markdown</DialogTitle>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-muted/60 bg-muted/20 p-8 text-center transition-colors hover:border-primary/40"
            >
              <UploadCloud className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium">Choose .md files or a .zip bundle</span>
              <span className="text-xs text-muted-foreground">You can select multiple files at once</span>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".md,.markdown,.zip"
              multiple
              hidden
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
            />

            {files.length > 0 && (
              <div className="max-h-32 space-y-1 overflow-auto rounded-lg border bg-muted/10 p-2 text-xs">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-muted-foreground">
                    <FileText size={13} className="shrink-0" /> <span className="truncate">{f.name}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
                Publish immediately (otherwise saved as drafts)
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={overwrite} onChange={(e) => setOverwrite(e.target.checked)} />
                Overwrite existing posts with the same slug
              </label>
            </div>

            <p className="text-xs text-muted-foreground">
              Each file needs YAML front matter (<code>title</code>, <code>categories</code>, <code>tags</code>, …)
              followed by the Markdown body. Missing categories are created automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <span className="text-emerald-500">{result.imported} imported</span>
              {result.updated > 0 && <span className="text-sky-500">{result.updated} updated</span>}
              {result.skipped > 0 && <span className="text-muted-foreground">{result.skipped} skipped</span>}
              {result.failed > 0 && <span className="text-destructive">{result.failed} failed</span>}
            </div>
            <div className="max-h-64 space-y-1.5 overflow-auto rounded-lg border p-3 text-xs">
              {result.results.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className={`mt-0.5 shrink-0 ${STATUS_UI[r.status].color}`}>{STATUS_UI[r.status].icon}</span>
                  <span className="min-w-0">
                    <span className="font-mono">{r.file}</span>
                    {r.message && <span className="text-muted-foreground"> — {r.message}</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          {!result ? (
            <>
              <Button variant="outline" onClick={close} disabled={loading}>Cancel</Button>
              <Button onClick={submit} disabled={loading || files.length === 0}>
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing…</>
                ) : (
                  `Import${files.length ? ` ${files.length}` : ""}`
                )}
              </Button>
            </>
          ) : (
            <Button onClick={close}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
