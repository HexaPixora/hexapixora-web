"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "@hexapixora/sdk/browser";
import { toast } from "sonner";
import { Button } from "@hexapixora/ui/button";
import { PageHeader, PageLoading, SectionCard } from "@hexapixora/ui/admin";
import { PACK_LIMITS } from "@hexapixora/contracts/theme-pack/files";
import { Download, Eye, Palette, Trash2, Upload } from "lucide-react";
import { useConfirm } from "@/components/admin/confirm-dialog";
import { siteUrl } from "@/lib/site-url";
import { useHasPermission } from "@/stores/use-auth-store";

type ThemePack = {
  id: string;
  slug: string;
  name: string;
  version: string;
  author: string;
  description: string;
  isActive: boolean;
  createdAt: string;
};

type ApiError = { response?: { data?: { message?: unknown; errors?: unknown } } };

/** The API's reasons, as a readable list. */
function reasonsOf(err: unknown): string[] {
  const data = (err as ApiError)?.response?.data;
  const errors = Array.isArray(data?.errors) ? data.errors.filter((e): e is string => typeof e === "string") : [];
  const message = typeof data?.message === "string" ? data.message : "Something went wrong.";
  return errors.length > 0 ? errors : [message];
}

/**
 * Theme packs (plans/phase-3b): upload a pack zip, preview it privately on the
 * real site, activate it, download it, or go back to the built-in theme.
 */
export default function ThemesPage() {
  const canManage = useHasPermission("layouts");
  const confirm = useConfirm();
  const fileInput = useRef<HTMLInputElement>(null);
  const [packs, setPacks] = useState<ThemePack[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [report, setReport] = useState<{ title: string; lines: string[]; tone: "ok" | "error" } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await apiClient.get("/themes");
      setPacks(res.data?.data ?? []);
    } catch (err) {
      toast.error(reasonsOf(err)[0]);
      setPacks([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const install = async (file: File) => {
    if (file.size > PACK_LIMITS.zipBytes) {
      setReport({ title: "Not installed", lines: [`The file is larger than ${PACK_LIMITS.zipBytes / 1024 / 1024} MB.`], tone: "error" });
      return;
    }
    setBusy("install");
    setReport(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await apiClient.post("/themes", form);
      const removed: string[] = res.data?.data?.removed ?? [];
      setReport({
        title: res.data?.message ?? "Installed",
        lines: removed.length ? ["These theme.css rules were left out:", ...removed] : ["Everything in the pack was accepted."],
        tone: "ok",
      });
      await load();
    } catch (err) {
      setReport({ title: "Not installed", lines: reasonsOf(err), tone: "error" });
    } finally {
      setBusy(null);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const activate = async (pack: ThemePack) => {
    const ok = await confirm({
      title: `Activate ${pack.name}?`,
      description: "Every visitor sees this theme within a few seconds. You can switch back at any time.",
      confirmText: "Activate",
    });
    if (!ok) return;
    setBusy(pack.id);
    try {
      await apiClient.post(`/themes/${pack.id}/activate`);
      toast.success(`${pack.name} is live`);
      await load();
    } catch (err) {
      toast.error(reasonsOf(err)[0]);
    } finally {
      setBusy(null);
    }
  };

  const useBuiltIn = async () => {
    const ok = await confirm({
      title: "Go back to the built-in theme?",
      description: "The installed packs stay installed; none of them is shown.",
      confirmText: "Use built-in theme",
    });
    if (!ok) return;
    setBusy("builtin");
    try {
      await apiClient.post("/themes/deactivate");
      toast.success("Built-in theme is live");
      await load();
    } catch (err) {
      toast.error(reasonsOf(err)[0]);
    } finally {
      setBusy(null);
    }
  };

  const preview = async (pack: ThemePack) => {
    // Open the tab first, so the browser treats it as a click and doesn't block it.
    const tab = window.open("about:blank", "_blank");
    try {
      const res = await apiClient.post(`/themes/${pack.id}/preview-token`);
      const token: string = res.data?.data?.token;
      const url = `${siteUrl("/")}?theme-preview=${encodeURIComponent(token)}`;
      if (tab) {
        tab.opener = null;
        tab.location.href = url;
      } else {
        window.open(url, "_blank", "noopener");
      }
    } catch (err) {
      tab?.close();
      toast.error(reasonsOf(err)[0]);
    }
  };

  const download = async (pack: ThemePack) => {
    try {
      const res = await apiClient.get(`/themes/${pack.id}/download`, { responseType: "blob" });
      const href = URL.createObjectURL(res.data as Blob);
      const link = Object.assign(document.createElement("a"), { href, download: `${pack.slug}-${pack.version}.zip` });
      link.click();
      URL.revokeObjectURL(href);
    } catch (err) {
      toast.error(reasonsOf(err)[0]);
    }
  };

  const remove = async (pack: ThemePack) => {
    const ok = await confirm({
      title: `Delete ${pack.name} ${pack.version}?`,
      description: "The pack and its files are removed. Download it first if you may need it again.",
      confirmText: "Delete",
      destructive: true,
    });
    if (!ok) return;
    setBusy(pack.id);
    try {
      await apiClient.delete(`/themes/${pack.id}`);
      toast.success("Theme deleted");
      await load();
    } catch (err) {
      toast.error(reasonsOf(err)[0]);
    } finally {
      setBusy(null);
    }
  };

  if (packs === null) return <PageLoading />;
  const activePack = packs.find((pack) => pack.isActive);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Themes"
        description="Install theme packs, preview them privately on the live site, and choose which one visitors see."
      >
        {canManage ? (
          <>
            <input
              ref={fileInput}
              type="file"
              accept=".zip,application/zip"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void install(file);
              }}
            />
            <Button onClick={() => fileInput.current?.click()} disabled={busy === "install"}>
              <Upload size={16} className="mr-2" />
              {busy === "install" ? "Installing…" : "Upload theme pack"}
            </Button>
          </>
        ) : null}
      </PageHeader>

      {report ? (
        <div
          role={report.tone === "error" ? "alert" : "status"}
          className={`rounded-lg border p-4 text-sm ${
            report.tone === "error" ? "border-destructive/40 bg-destructive/5" : "border-emerald-500/40 bg-emerald-500/5"
          }`}
        >
          <p className="font-semibold">{report.title}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            {report.lines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <SectionCard
        title="Built-in theme"
        description="Hexa Noir, as shipped with the site. Visitors see it whenever no pack is active."
        action={
          activePack && canManage ? (
            <Button variant="outline" size="sm" onClick={useBuiltIn} disabled={busy === "builtin"}>
              Use built-in theme
            </Button>
          ) : (
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600">Active</span>
          )
        }
      >
        <p className="text-sm text-muted-foreground">
          {activePack ? `Currently replaced by ${activePack.name} ${activePack.version}.` : "This is what visitors see now."}
        </p>
      </SectionCard>

      <SectionCard title="Installed packs" description={`A pack is a .zip with theme.json, an optional theme.css and assets/ (fonts and images), up to ${PACK_LIMITS.zipBytes / 1024 / 1024} MB.`}>
        {packs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
            <Palette size={28} />
            No theme packs installed yet.
          </div>
        ) : (
          <ul className="divide-y">
            {packs.map((pack) => (
              <li key={pack.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold">
                    {pack.name} <span className="font-mono text-xs text-muted-foreground">{pack.version}</span>
                    {pack.isActive ? (
                      <span className="ml-2 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                        Active
                      </span>
                    ) : null}
                  </p>
                  {pack.description ? <p className="text-sm text-muted-foreground">{pack.description}</p> : null}
                  <p className="text-xs text-muted-foreground">
                    {pack.author ? `${pack.author} · ` : ""}Installed {new Date(pack.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {canManage ? (
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => void preview(pack)}>
                      <Eye size={14} className="mr-1.5" /> Preview
                    </Button>
                    {!pack.isActive ? (
                      <Button size="sm" onClick={() => void activate(pack)} disabled={busy === pack.id}>
                        Activate
                      </Button>
                    ) : null}
                    <Button variant="outline" size="sm" onClick={() => void download(pack)} title="Download as zip">
                      <Download size={14} />
                    </Button>
                    {!pack.isActive ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => void remove(pack)}
                        disabled={busy === pack.id}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
