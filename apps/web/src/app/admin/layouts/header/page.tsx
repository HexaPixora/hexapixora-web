"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { headerSchema, HeaderConfig, DEFAULT_HEADER_CONFIG } from "@/lib/module-schemas/header-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { revalidateCMS } from "@/actions/revalidate";
import MediaField from "@/components/admin/media-field";
import { useHasPermission } from "@/stores/use-auth-store";
import { PageHeader, SectionCard, Field, PageLoading } from "@/components/admin/ui";

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function HeaderBuilderPage() {
  const canManage = useHasPermission("layouts");
  const [config, setConfig] = useState<HeaderConfig>(DEFAULT_HEADER_CONFIG);
  const [navigations, setNavigations] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get("/layouts/header").catch(() => null),
      apiClient.get("/layouts/navigations").catch(() => null),
    ]).then(([headerRes, navsRes]) => {
      if (headerRes?.data?.data) setConfig({ ...DEFAULT_HEADER_CONFIG, ...headerRes.data.data });
      if (navsRes?.data?.data) setNavigations(navsRes.data.data);
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const validConfig = headerSchema.parse(config);
      await apiClient.put("/layouts/header", validConfig);
      setSaved(true);
      await revalidateCMS();
      toast.success("Header saved");
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error("Validation failed or server error.");
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof HeaderConfig, value: any) => setConfig({ ...config, [key]: value });

  if (loading) return <PageLoading label="Loading header settings…" />;

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader title="Header Builder" description="Customize the global site header style and navigation.">
        {canManage && (
          <Button onClick={save} disabled={saving}>
            {saved ? "✓ Saved!" : saving ? "Saving…" : "Save Header"}
          </Button>
        )}
      </PageHeader>

      <SectionCard title="Navigation & Branding" bodyClassName="space-y-5">
        <Field label="Navigation Menu" hint="Menus can be created in the Navigations builder.">
          <select value={config.navId} onChange={(e) => update("navId", e.target.value)} className={SELECT_CLASS}>
            <option value="">No menu selected</option>
            {navigations.map((nav) => (
              <option key={nav.id} value={nav.id}>{nav.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Custom Logo (optional)">
          <MediaField
            type="image"
            value={config.logoUrl || ""}
            onChange={(url) => update("logoUrl", url)}
            placeholder="https://… (leave blank to use the Global Settings logo)"
            showPreview={false}
          />
          {config.logoUrl && (
            <div className="mt-2 inline-block rounded-md border bg-muted/20 p-2">
              <img src={config.logoUrl} alt="Logo preview" className="h-10 w-auto object-contain" />
            </div>
          )}
        </Field>
      </SectionCard>

      <SectionCard title="Layout & Styling" bodyClassName="space-y-5">
        <Field label="Layout Style">
          <select value={config.layoutStyle} onChange={(e) => update("layoutStyle", e.target.value as any)} className={SELECT_CLASS}>
            <option value="logo-left">Logo Left, Menu Right</option>
            <option value="logo-center">Logo Center</option>
            <option value="split">Split (Logo Left, CTA Right, Menu Center)</option>
          </select>
        </Field>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={config.isSticky} onChange={(e) => update("isSticky", e.target.checked)} className="rounded border-input" />
            Sticky header (stays at top while scrolling)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={config.glassmorphism} onChange={(e) => update("glassmorphism", e.target.checked)} className="rounded border-input" />
            Glassmorphism (blur effect)
          </label>
        </div>
      </SectionCard>

      <SectionCard title="Call to Action (CTA) Button">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Button Text">
            <Input value={config.ctaText || ""} onChange={(e) => update("ctaText", e.target.value)} placeholder="Get in Touch" />
          </Field>
          <Field label="Button Link">
            <Input value={config.ctaUrl || ""} onChange={(e) => update("ctaUrl", e.target.value)} placeholder="/contact" />
          </Field>
          <Field label="Button Style" className="sm:col-span-2">
            <select value={config.ctaStyle} onChange={(e) => update("ctaStyle", e.target.value as any)} className={SELECT_CLASS}>
              <option value="default">Default</option>
              <option value="primary">Primary</option>
              <option value="outline">Outline</option>
              <option value="ghost">Ghost (text only)</option>
            </select>
          </Field>
        </div>
      </SectionCard>
    </div>
  );
}
