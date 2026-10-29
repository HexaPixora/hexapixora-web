"use client";

import { useEffect, useMemo, useState } from "react";
import { Puck, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { apiClient } from "@hexapixora/sdk/browser";
import type { Section } from "@hexapixora/contracts/blocks/legacy/migrate";
import {
  buildPuckConfig,
  type CustomFieldFactory,
} from "@/lib/puck/puck-config";
import { sectionsToPuck } from "@/lib/puck/puck-sections";
import { BlockPreview } from "./block-preview";
import { EditorFrame } from "./editor-frame";

type Loaded = {
  title: string;
  data: Data;
  dropped: number;
  defaults: Record<string, Record<string, unknown>>;
  packCss: string;
  posts: unknown[];
};

// Read-only preview for now (plans/phase-4, 4-2): media, rich text and
// category controls arrive with the editor in 4-3.
const placeholderField: CustomFieldFactory = (field) => ({
  type: "text",
  label: field.label,
});

const json = (res: { data?: { data?: unknown } } | null) => res?.data?.data;

// Real screen sizes. A fixed height keeps full-screen blocks (100vh heroes) at
// a screen's height; with "auto", Puck stretches the frame to fill the panel.
const VIEWPORTS = [
  { width: 390, height: 844, label: "Phone", icon: "Smartphone" as const },
  { width: 834, height: 1112, label: "Tablet", icon: "Tablet" as const },
  { width: 1440, height: 900, label: "Laptop", icon: "Monitor" as const },
];

/** A page in the Puck editor, drawn with the site's theme and the active theme pack. */
export function PageEditor({ pageId }: { pageId: string }) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiClient.get(`/pages/admin/${pageId}`).catch(() => null),
      apiClient.get("/layouts/module-defaults").catch(() => null),
      apiClient.get("/themes/active").catch(() => null),
      apiClient.get("/blogs?published=true&limit=12").catch(() => null),
    ]).then(([pageRes, defaultsRes, themeRes, postsRes]) => {
      if (cancelled) return;
      const page = json(pageRes) as
        | { title?: string; sections?: unknown }
        | undefined;
      if (!page) return setError("Page not found.");
      const stored =
        typeof page.sections === "string"
          ? JSON.parse(page.sections)
          : page.sections;
      const defaults = (json(defaultsRes) ?? {}) as Loaded["defaults"];
      const { content, dropped } = sectionsToPuck(
        Array.isArray(stored) ? (stored as Section[]) : [],
        defaults,
      );
      const css = (json(themeRes) as { css?: unknown } | undefined)?.css;
      const posts = json(postsRes);
      setLoaded({
        title: page.title ?? "",
        data: { content, root: { props: {} } },
        dropped: dropped.length,
        defaults,
        packCss: typeof css === "string" ? css : "",
        posts: Array.isArray(posts) ? posts : [],
      });
    });
    return () => {
      cancelled = true;
    };
  }, [pageId]);

  const config = useMemo(
    () =>
      loaded &&
      buildPuckConfig({
        custom: placeholderField,
        defaults: loaded.defaults,
        render: (type, props) => (
          <BlockPreview type={type} props={props} posts={loaded.posts} />
        ),
      }),
    [loaded],
  );

  if (error) return <p className="p-6 text-sm text-destructive">{error}</p>;
  if (!loaded || !config)
    return (
      <p className="p-6 text-sm text-muted-foreground">Loading the page…</p>
    );

  return (
    <div className="h-[calc(100vh-3.5rem)]">
      <Puck
        config={config}
        data={loaded.data}
        headerTitle={loaded.title}
        iframe={{ enabled: true, waitForStyles: true }}
        viewports={VIEWPORTS}
        permissions={{
          drag: false,
          delete: false,
          duplicate: false,
          insert: false,
          edit: false,
        }}
        overrides={{
          iframe: ({ children, document }) => (
            <EditorFrame document={document} packCss={loaded.packCss}>
              {children}
            </EditorFrame>
          ),
        }}
      />
    </div>
  );
}
