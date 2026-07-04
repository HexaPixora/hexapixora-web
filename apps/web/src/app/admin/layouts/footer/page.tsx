"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { footerSchema, FooterConfig, DEFAULT_FOOTER_CONFIG } from "@/lib/module-schemas/footer-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import MediaField from "@/components/admin/media-field";
import { SocialIcon, SOCIAL_ICON_OPTIONS } from "@/components/icons/social-icons";
import { revalidateCMS } from "@/actions/revalidate";
import { useHasPermission } from "@/stores/use-auth-store";
import { PageHeader, SectionCard, Field, PageLoading } from "@/components/admin/ui";

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function FooterBuilderPage() {
  const canManage = useHasPermission("layouts");
  const [config, setConfig] = useState<FooterConfig>(DEFAULT_FOOTER_CONFIG);
  const [navigations, setNavigations] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get("/layouts/footer").catch(() => null),
      apiClient.get("/layouts/navigations").catch(() => null),
    ]).then(([footerRes, navsRes]) => {
      if (footerRes?.data?.data) setConfig({ ...DEFAULT_FOOTER_CONFIG, ...footerRes.data.data });
      if (navsRes?.data?.data) setNavigations(navsRes.data.data);
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
      toast.success("Footer saved");
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error("Validation failed or server error.");
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof FooterConfig, value: any) => setConfig({ ...config, [key]: value });

  const updateSocial = (index: number, field: "platform" | "url" | "icon" | "color", value: string) => {
    const newSocials = [...(config.socials || [])];
    newSocials[index] = { ...newSocials[index], [field]: value } as any;
    update("socials", newSocials);
  };

  const addSocial = () => {
    update("socials", [...(config.socials || []), { platform: "New Platform", url: "https://", icon: "link", color: "" }]);
  };

  const removeSocial = (index: number) => {
    const newSocials = [...(config.socials || [])];
    newSocials.splice(index, 1);
    update("socials", newSocials);
  };

  if (loading) return <PageLoading label="Loading footer settings…" />;

  const navColumn = (n: 1 | 2) => {
    const titleKey = `col${n}Title` as keyof FooterConfig;
    const navKey = `col${n}NavId` as keyof FooterConfig;
    return (
      <div className="space-y-4 rounded-lg border bg-muted/10 p-4">
        <Field label={`Column ${n} Title`}>
          <Input value={(config[titleKey] as string) || ""} onChange={(e) => update(titleKey, e.target.value)} placeholder={n === 1 ? "Quick Links" : "Legal"} />
        </Field>
        <Field label="Menu">
          <select value={(config[navKey] as string) || ""} onChange={(e) => update(navKey, e.target.value)} className={SELECT_CLASS}>
            <option value="">No menu selected</option>
            {navigations.map((nav) => <option key={nav.id} value={nav.id}>{nav.name}</option>)}
          </select>
        </Field>
      </div>
    );
  };

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader title="Footer Builder" description="Customize the global footer styling, navigation columns, and social links.">
        {canManage && (
          <Button onClick={save} disabled={saving}>
            {saved ? "✓ Saved!" : saving ? "Saving…" : "Save Footer"}
          </Button>
        )}
      </PageHeader>

      <SectionCard title="Branding & Styling">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          <Field label="Background Color Style">
            <select value={config.backgroundColor} onChange={(e) => update("backgroundColor", e.target.value as any)} className={SELECT_CLASS}>
              <option value="glass">Glass (frosted, matches header)</option>
              <option value="default">Default</option>
              <option value="muted">Muted (light/dark gray)</option>
              <option value="dark">Dark theme fixed</option>
            </select>
          </Field>
          <Field label="Tagline / Description" className="md:col-span-2">
            <Input value={config.tagline || ""} onChange={(e) => update("tagline", e.target.value)} placeholder="A short description under the logo…" />
          </Field>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" checked={config.showNewsletter} onChange={(e) => update("showNewsletter", e.target.checked)} className="rounded border-input" />
            Show newsletter subscription box
          </label>
        </div>
      </SectionCard>

      <SectionCard title="Navigation Columns" description="Select menus from the Navigations builder to display as footer columns.">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {navColumn(1)}
          {navColumn(2)}
        </div>
      </SectionCard>

      <SectionCard
        title="Social Links"
        description="Point each link to a URL, then pick its icon and color."
        action={canManage ? (
          <Button variant="outline" size="sm" className="border-dashed" onClick={addSocial}>
            <Plus size={14} className="mr-1.5" /> Add
          </Button>
        ) : undefined}
        bodyClassName="space-y-3"
      >
        {config.socials?.map((social, idx) => (
          <div key={idx} className="space-y-3 rounded-lg border bg-background p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted/30" style={social.color ? { color: social.color } : undefined}>
                <SocialIcon name={social.icon} size={18} />
              </span>
              <Input value={social.platform} onChange={(e) => updateSocial(idx, "platform", e.target.value)} placeholder="Platform name (e.g. LinkedIn)" className="flex-1" />
              <Button variant="ghost" size="icon" className="shrink-0 text-destructive" onClick={() => removeSocial(idx)}>
                <Trash2 size={16} />
              </Button>
            </div>
            <Field label="Link URL">
              <Input value={social.url || ""} onChange={(e) => updateSocial(idx, "url", e.target.value)} placeholder="https://…" />
            </Field>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="Icon">
                <select value={social.icon || "link"} onChange={(e) => updateSocial(idx, "icon", e.target.value)} className={SELECT_CLASS}>
                  {SOCIAL_ICON_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </Field>
              <Field label="Icon Color">
                <div className="flex items-center gap-2">
                  <input type="color" value={social.color || "#000000"} onChange={(e) => updateSocial(idx, "color", e.target.value)} className="h-10 w-12 cursor-pointer rounded-md border border-input bg-background p-1" />
                  <Input value={social.color || ""} onChange={(e) => updateSocial(idx, "color", e.target.value)} placeholder="Inherit theme" className="flex-1 font-mono text-sm" />
                  {social.color && (
                    <Button variant="ghost" size="sm" className="shrink-0" onClick={() => updateSocial(idx, "color", "")}>Reset</Button>
                  )}
                </div>
              </Field>
            </div>
          </div>
        ))}
        {(!config.socials || config.socials.length === 0) && (
          <p className="text-sm text-muted-foreground">No social links yet.</p>
        )}
      </SectionCard>
    </div>
  );
}
