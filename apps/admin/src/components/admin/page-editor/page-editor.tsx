"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Puck, type Config, type Data, type Fields } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@hexapixora/sdk/browser";
import { Button } from "@hexapixora/ui/button";
import type { Section } from "@hexapixora/contracts/blocks/registry";
import { useConfirm } from "@/components/admin/confirm-dialog";
import { buildPuckConfig } from "@/lib/puck/puck-config";
import { pageToRoot, toPayload } from "@/lib/puck/puck-page";
import { sectionsToPuck } from "@/lib/puck/puck-sections";
import { useUnsavedChanges } from "@/lib/use-unsaved-changes";
import { useHasPermission } from "@/stores/use-auth-store";
import { BlockPreview } from "./block-preview";
import { editorField, mediaField, publishingField } from "./editor-fields";
import { EditorFrame } from "./editor-frame";

type Loaded = {
  data: Data;
  dropped: number;
  defaults: Record<string, Record<string, unknown>>;
  packCss: string;
  posts: unknown[];
};

const json = (res: { data?: { data?: unknown } } | null) => res?.data?.data;

const yesNo = (label: string) => ({
  type: "radio" as const,
  label,
  options: [
    { label: "Shown", value: true },
    { label: "Hidden", value: false },
  ],
});

// The page panel (shown when no block is selected).
const ROOT_FIELDS: Fields = {
  publishing: publishingField("Status"),
  title: { type: "text", label: "Page title" },
  slug: { type: "text", label: "Address (slug)" },
  showHeader: yesNo("Site header"),
  showFooter: yesNo("Site footer"),
  metaTitle: { type: "text", label: "Search title" },
  metaDescription: { type: "textarea", label: "Search description" },
  ogImage: mediaField("Share image", "image"),
};

// Real screen sizes. A fixed height keeps full-screen blocks (100vh heroes) at
// a screen's height; with "auto", Puck stretches the frame to fill the panel.
const VIEWPORTS = [
  { width: 390, height: 844, label: "Phone", icon: "Smartphone" as const },
  { width: 834, height: 1112, label: "Tablet", icon: "Tablet" as const },
  { width: 1440, height: 900, label: "Laptop", icon: "Monitor" as const },
];

const READ_ONLY = {
  drag: false,
  delete: false,
  duplicate: false,
  insert: false,
  edit: false,
};

function errorMessage(err: unknown): string {
  const e = err as {
    response?: { data?: { message?: unknown } };
    message?: unknown;
  };
  const message = e.response?.data?.message ?? e.message;
  return Array.isArray(message) ? message.join(", ") : String(message ?? "");
}

/**
 * The page editor: the page's blocks in Puck, drawn with the site's theme and
 * the active theme pack, plus the page's settings in the page panel. Saves in
 * our stored section format (plans/phase-4).
 */
export function PageEditor({ pageId }: { pageId: string }) {
  const router = useRouter();
  const confirm = useConfirm();
  const canManage = useHasPermission("pages");
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [current, setCurrent] = useState<Data | null>(null);
  const [saved, setSaved] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiClient.get(`/pages/admin/${pageId}`).catch(() => null),
      apiClient.get("/layouts/module-defaults").catch(() => null),
      apiClient.get("/themes/active").catch(() => null),
      apiClient.get("/blogs?published=true&limit=12").catch(() => null),
    ]).then(([pageRes, defaultsRes, themeRes, postsRes]) => {
      if (cancelled) return;
      const page = json(pageRes) as Record<string, unknown> | undefined;
      if (!page) {
        toast.error("Page not found");
        router.push("/admin/pages");
        return;
      }
      let stored: unknown = page.sections;
      try {
        if (typeof stored === "string") stored = JSON.parse(stored);
      } catch {
        stored = [];
      }
      const defaults = (json(defaultsRes) ?? {}) as Loaded["defaults"];
      const { content, dropped } = sectionsToPuck(
        Array.isArray(stored) ? (stored as Section[]) : [],
      );
      const data: Data = { content, root: { props: pageToRoot(page) } };
      const css = (json(themeRes) as { css?: unknown } | undefined)?.css;
      const posts = json(postsRes);
      setLoaded({
        data,
        dropped: dropped.length,
        defaults,
        packCss: typeof css === "string" ? css : "",
        posts: Array.isArray(posts) ? posts : [],
      });
      setCurrent(data);
      setSaved(JSON.stringify(toPayload(data)));
    });
    return () => {
      cancelled = true;
    };
  }, [pageId, router]);

  const config = useMemo<Config | null>(
    () =>
      loaded && {
        ...buildPuckConfig({
          custom: editorField,
          defaults: loaded.defaults,
          render: (type, props) => (
            <BlockPreview type={type} props={props} posts={loaded.posts} />
          ),
        }),
        root: { fields: ROOT_FIELDS },
      },
    [loaded],
  );

  const payload = useMemo(
    () => (current ? toPayload(current) : null),
    [current],
  );
  const dirty = !!payload && JSON.stringify(payload) !== saved;
  useUnsavedChanges(dirty);

  // Puck's panels are light; the admin is dark. Our controls inside them (and
  // the media and confirm dialogs) follow the admin's tokens, so the editor
  // switches the admin to light while it is open.
  useEffect(() => {
    const html = document.documentElement;
    const scheme = html.style.colorScheme;
    html.classList.remove("dark");
    html.style.colorScheme = "light";
    return () => {
      html.classList.add("dark");
      html.style.colorScheme = scheme;
    };
  }, []);

  const save = async () => {
    if (!payload) return;
    setSaving(true);
    try {
      await apiClient.put(`/pages/${pageId}`, payload);
      setSaved(JSON.stringify(payload));
      setLoaded((prev) => prev && { ...prev, dropped: 0 });
      toast.success("Page saved");
    } catch (err) {
      toast.error(`Save failed: ${errorMessage(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const goBack = async () => {
    if (
      dirty &&
      !(await confirm({
        title: "Discard unsaved changes?",
        description: "You have unsaved changes that will be lost if you leave.",
        confirmText: "Discard",
        destructive: true,
      }))
    )
      return;
    router.push("/admin/pages");
  };

  if (!loaded || !config)
    return (
      <p className="p-6 text-sm text-muted-foreground">Loading the page…</p>
    );

  return (
    // Full screen over the admin's sidebar and top bar.
    <div className="fixed inset-0 z-40 flex flex-col bg-background">
      {loaded.dropped > 0 && (
        <p className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-700 dark:text-amber-400">
          {loaded.dropped === 1
            ? "1 old section can't be edited here"
            : `${loaded.dropped} old sections can't be edited here`}{" "}
          (removed block types). Saving removes{" "}
          {loaded.dropped === 1 ? "it" : "them"} from the page.
        </p>
      )}
      <div className="min-h-0 flex-1">
        <Puck
          config={config}
          data={loaded.data}
          onChange={setCurrent}
          headerPath={payload ? `/${payload.slug}` : undefined}
          height="100%"
          iframe={{ enabled: true, waitForStyles: true }}
          viewports={VIEWPORTS}
          permissions={canManage ? undefined : READ_ONLY}
          overrides={{
            headerActions: () => (
              <>
                <Button variant="outline" size="sm" onClick={goBack}>
                  <ArrowLeft size={14} className="mr-1.5" /> Pages
                </Button>
                {canManage ? (
                  <Button size="sm" onClick={save} disabled={saving || !dirty}>
                    {saving ? "Saving…" : dirty ? "Save page" : "Saved"}
                  </Button>
                ) : (
                  <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    View only
                  </span>
                )}
              </>
            ),
            iframe: ({ children, document }) => (
              <EditorFrame document={document} packCss={loaded.packCss}>
                {children}
              </EditorFrame>
            ),
          }}
        />
      </div>
    </div>
  );
}
