"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@hexapixora/sdk/browser";
import { PageHeader, PageLoading } from "@hexapixora/ui/admin";
import { HEXA_NOIR_TOKENS } from "@hexapixora/contracts/theme-pack/hexa-noir";
import { themeTokensSchema } from "@hexapixora/contracts/theme-pack/schema";
import { ArrowLeft } from "lucide-react";
import { ThemeEditor, nextVersion, type EditorStart } from "@/components/admin/theme-editor/theme-editor";

const BUILT_IN: EditorStart = {
  baseId: null,
  baseCss: "",
  name: "Hexa Noir (custom)",
  slug: "hexa-noir-custom",
  version: "1.0.0",
  description: "The built-in theme, adjusted.",
  tokens: HEXA_NOIR_TOKENS,
};

type PackDetail = {
  id: string;
  name: string;
  slug: string;
  version: string;
  description: string;
  css: string;
  manifest: { tokens?: unknown };
};

function EditorLoader() {
  const baseId = useSearchParams().get("base");
  const [start, setStart] = useState<EditorStart | null>(baseId ? null : BUILT_IN);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!baseId) return;
    apiClient
      .get(`/themes/${encodeURIComponent(baseId)}`)
      .then((res) => {
        const pack = res.data?.data as PackDetail;
        setStart({
          baseId: pack.id,
          baseCss: pack.css,
          name: pack.name,
          slug: pack.slug,
          version: nextVersion(pack.version),
          description: pack.description,
          tokens: themeTokensSchema.parse(pack.manifest?.tokens ?? {}),
        });
      })
      .catch(() => setError("This theme could not be loaded."));
  }, [baseId]);

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!start) return <PageLoading />;
  return <ThemeEditor start={start} />;
}

/** The theme editor: adjust tokens with a live preview and save a new version. */
export default function ThemeEditPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit theme"
        description="Changes show in the preview at once; visitors see nothing until you activate the saved version."
      >
        <Link
          href="/admin/themes"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} /> All themes
        </Link>
      </PageHeader>
      <Suspense fallback={<PageLoading />}>
        <EditorLoader />
      </Suspense>
    </div>
  );
}
