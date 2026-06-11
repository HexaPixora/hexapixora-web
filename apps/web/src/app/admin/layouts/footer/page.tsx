"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { footerSchema, FooterConfig, DEFAULT_FOOTER_CONFIG } from "@/lib/module-schemas/footer-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { revalidateCMS } from "@/actions/revalidate";

export default function FooterBuilderPage() {
  const [config, setConfig] = useState<FooterConfig>(DEFAULT_FOOTER_CONFIG);
  const [navigations, setNavigations] = useState<{id: string, name: string}[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get("/layouts/footer").catch(() => null),
      apiClient.get("/layouts/navigations").catch(() => null)
    ]).then(([footerRes, navsRes]) => {
      if (footerRes?.data?.data) {
        setConfig({ ...DEFAULT_FOOTER_CONFIG, ...footerRes.data.data });
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
      const validConfig = footerSchema.parse(config);
      await apiClient.put("/layouts/footer", validConfig);
      setSaved(true);
      await revalidateCMS();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert("Validation failed or server error.");
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof FooterConfig, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  const updateSocial = (index: number, field: "platform" | "url" | "icon", value: string) => {
    const newSocials = [...(config.socials || [])];
    newSocials[index] = { ...newSocials[index], [field]: value } as any;
    update("socials", newSocials);
  };

  const addSocial = () => {
    update("socials", [...(config.socials || []), { platform: "New Platform", url: "https://", icon: "" }]);
  };

  const removeSocial = (index: number) => {
    const newSocials = [...(config.socials || [])];
    newSocials.splice(index, 1);
    update("socials", newSocials);
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Footer Builder</h1>
          <p className="text-muted-foreground">Customize the global site footer styling, navigations, and social links.</p>
        </div>
        <Button onClick={save} disabled={saving}>
          {saved ? "✓ Saved!" : saving ? "Saving..." : "Save Footer"}
        </Button>
      </div>

      <div className="bg-card border rounded-xl p-6 space-y-8">
        
        {/* Branding & Style */}
        <div className="space-y-4 border-b pb-6">
          <h3 className="font-semibold text-lg">Branding & Styling</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Logo URL (Optional)</label>
              <Input 
                value={config.logoUrl || ""} 
                onChange={e => update("logoUrl", e.target.value)} 
                placeholder="Leave blank to use Global Settings logo"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Background Color Style</label>
              <select 
                value={config.backgroundColor} 
                onChange={e => update("backgroundColor", e.target.value as any)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="default">Default</option>
                <option value="muted">Muted (Light gray/dark gray)</option>
                <option value="dark">Dark Theme Fixed</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Tagline / Description</label>
              <Input 
                value={config.tagline || ""} 
                onChange={e => update("tagline", e.target.value)} 
                placeholder="A short description under the logo..."
              />
            </div>
            <div className="space-y-2 md:col-span-2 mt-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={config.showNewsletter} onChange={e => update("showNewsletter", e.target.checked)} className="rounded border-gray-300" />
                Show Newsletter Subscription Box
              </label>
            </div>
          </div>
        </div>

        {/* Navigation Columns */}
        <div className="space-y-4 border-b pb-6">
          <h3 className="font-semibold text-lg">Navigation Columns</h3>
          <p className="text-xs text-muted-foreground mb-4">Select menus from the Navigations builder to display as columns in the footer.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1 */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/10">
              <div className="space-y-2">
                <label className="text-sm font-medium">Column 1 Title</label>
                <Input value={config.col1Title || ""} onChange={e => update("col1Title", e.target.value)} placeholder="Quick Links" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Menu</label>
                <select 
                  value={config.col1NavId || ""} 
                  onChange={e => update("col1NavId", e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">No Menu Selected</option>
                  {navigations.map(nav => (
                    <option key={nav.id} value={nav.id}>{nav.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/10">
              <div className="space-y-2">
                <label className="text-sm font-medium">Column 2 Title</label>
                <Input value={config.col2Title || ""} onChange={e => update("col2Title", e.target.value)} placeholder="Legal" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Menu</label>
                <select 
                  value={config.col2NavId || ""} 
                  onChange={e => update("col2NavId", e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">No Menu Selected</option>
                  {navigations.map(nav => (
                    <option key={nav.id} value={nav.id}>{nav.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Social Links</h3>
          <div className="space-y-3">
            {config.socials?.map((social, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-background border rounded-lg">
                <Input 
                  value={social.platform} 
                  onChange={e => updateSocial(idx, "platform", e.target.value)} 
                  placeholder="Platform Name" 
                  className="w-1/3"
                />
                <Input 
                  value={social.url} 
                  onChange={e => updateSocial(idx, "url", e.target.value)} 
                  placeholder="https://..." 
                  className="flex-1"
                />
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeSocial(idx)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="border-dashed mt-2" onClick={addSocial}>
            <Plus size={14} className="mr-2" /> Add Social Link
          </Button>
        </div>

      </div>
    </div>
  );
}
