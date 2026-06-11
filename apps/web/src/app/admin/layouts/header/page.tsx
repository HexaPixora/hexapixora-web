"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { headerSchema, HeaderConfig, DEFAULT_HEADER_CONFIG } from "@/lib/module-schemas/header-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { revalidateCMS } from "@/actions/revalidate";
import { Loader2 } from "lucide-react";

export default function HeaderBuilderPage() {
  const [config, setConfig] = useState<HeaderConfig>(DEFAULT_HEADER_CONFIG);
  const [navigations, setNavigations] = useState<{id: string, name: string}[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get("/layouts/header").catch(() => null),
      apiClient.get("/layouts/navigations").catch(() => null)
    ]).then(([headerRes, navsRes]) => {
      if (headerRes?.data?.data) {
        setConfig({ ...DEFAULT_HEADER_CONFIG, ...headerRes.data.data });
      }
      if (navsRes?.data?.data) {
        setNavigations(navsRes.data.data);
      }
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      // Validate before saving
      const validConfig = headerSchema.parse(config);
      await apiClient.put("/layouts/header", validConfig);
      setSaved(true);
      await revalidateCMS();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert("Validation failed or server error.");
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof HeaderConfig, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Header Builder</h1>
          <p className="text-muted-foreground">Customize the global site header style and navigation.</p>
        </div>
        <Button onClick={save} disabled={saving}>
          {saved ? "✓ Saved!" : saving ? "Saving..." : "Save Header"}
        </Button>
      </div>

      <div className="bg-card border rounded-xl p-6 space-y-6">
        <div className="space-y-4 border-b pb-6">
          <h3 className="font-semibold text-lg">Navigation & Branding</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Navigation Menu</label>
            <select 
              value={config.navId} 
              onChange={e => update("navId", e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">No Menu Selected</option>
              {navigations.map(nav => (
                <option key={nav.id} value={nav.id}>{nav.name}</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">Menus can be created in the Navigations builder.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Logo URL (Optional)</label>
            <Input 
              value={config.logoUrl || ""} 
              onChange={e => update("logoUrl", e.target.value)} 
              placeholder="https://... (Leave blank to use Global Settings logo)"
            />
          </div>
        </div>

        <div className="space-y-4 border-b pb-6">
          <h3 className="font-semibold text-lg">Layout & Styling</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Layout Style</label>
            <select 
              value={config.layoutStyle} 
              onChange={e => update("layoutStyle", e.target.value as any)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="logo-left">Logo Left, Menu Right</option>
              <option value="logo-center">Logo Center</option>
              <option value="split">Split (Logo Left, CTA Right, Menu Center)</option>
            </select>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={config.isSticky} onChange={e => update("isSticky", e.target.checked)} className="rounded border-gray-300" />
              Sticky Header (Stays at top while scrolling)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={config.glassmorphism} onChange={e => update("glassmorphism", e.target.checked)} className="rounded border-gray-300" />
              Glassmorphism (Blur effect)
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Call to Action (CTA) Button</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Button Text</label>
              <Input 
                value={config.ctaText || ""} 
                onChange={e => update("ctaText", e.target.value)} 
                placeholder="Get in Touch"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Button Link</label>
              <Input 
                value={config.ctaUrl || ""} 
                onChange={e => update("ctaUrl", e.target.value)} 
                placeholder="/contact"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">Button Style</label>
              <select 
                value={config.ctaStyle} 
                onChange={e => update("ctaStyle", e.target.value as any)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="default">Default</option>
                <option value="primary">Primary</option>
                <option value="outline">Outline</option>
                <option value="ghost">Ghost (Text only)</option>
              </select>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
