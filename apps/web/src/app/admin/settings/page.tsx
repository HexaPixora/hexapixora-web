"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SeoTab from "@/components/admin/seo-tab";
import MediaPicker from "@/components/admin/media-picker";
import { revalidateCMS } from "@/actions/revalidate";
import { useHasPermission } from "@/stores/use-auth-store";
import {
  Settings, Globe, Palette, Search, Code,
  UploadCloud, Mail, Phone, MapPin, Map, Clock, Image as ImageIcon, ImagePlus
} from "lucide-react";

export default function AdminSettingsPage() {
  const canManage = useHasPermission("settings");
  const [settings, setSettings] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  // Which branding field currently has the media library picker open.
  const [pickerField, setPickerField] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get("/settings").then(res => setSettings(res.data || {})).catch(console.error);
  }, []);

  const update = (field: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiClient.post("/settings", settings);
      setSettings(res.data);
      // Bust the public site's cached layout data so the new logo/branding
      // (used as the header/footer fallback) shows up immediately.
      await revalidateCMS();
      setSaved(true);
      toast.success("Settings saved");
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const uploadLogo = async (field: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await apiClient.post("/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      update(field, res.data.url);
      // The backend deduplicates by content: a re-upload of the same asset
      // returns the existing record rather than storing a copy.
      if (res.data.deduped) {
        toast.info("This image already existed in your library — reused it.");
      } else {
        toast.success("Image uploaded");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Upload failed");
    }
  };

  const LogoUploader = ({ field, label, description }: { field: string; label: string, description: string }) => (
    <div className="flex flex-col md:flex-row gap-6 p-5 border rounded-xl bg-card/50 hover:bg-card/80 transition-colors">
      <div className="flex-1 space-y-1.5">
        <h4 className="text-sm font-semibold">{label}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2">
            <UploadCloud size={16} className="mr-2" />
            {settings[field] ? "Replace Image" : "Upload Image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => e.target.files?.[0] && uploadLogo(field, e.target.files[0])}
            />
          </label>
          <Button variant="outline" size="sm" className="h-9" onClick={() => setPickerField(field)}>
            <ImagePlus size={16} className="mr-2" />
            Select from Media
          </Button>
          {settings[field] && (
            <Button variant="ghost" size="sm" onClick={() => update(field, "")} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
              Remove
            </Button>
          )}
        </div>
      </div>
      
      <div className="w-full md:w-48 h-32 rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/30 flex items-center justify-center relative overflow-hidden group">
        {settings[field] ? (
          <img src={settings[field]} alt={label} className="w-full h-full object-contain p-2" />
        ) : (
          <div className="flex flex-col items-center text-muted-foreground/50">
            <ImageIcon size={24} className="mb-2" />
            <span className="text-xs font-medium">No Image</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-12">

      {/* Media library picker for branding assets */}
      <MediaPicker
        open={pickerField !== null}
        onClose={() => setPickerField(null)}
        onSelect={(url) => pickerField && update(pickerField, url)}
        title="Select Branding Image"
        description="Pick an existing image from your media library, or upload a new one."
      />

      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-background to-background border p-8 shadow-sm">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
              <Settings size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Global Settings</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage core configuration, branding, and integrations.</p>
            </div>
          </div>
          {canManage && (
            <Button onClick={handleSave} disabled={saving} size="lg" className="shadow-md shadow-primary/20 transition-all hover:scale-[1.02]">
              {saved ? "✓ Saved Successfully!" : saving ? "Saving changes..." : "Save Configuration"}
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="general" className="flex flex-col md:flex-row gap-8 w-full">
        
        <TabsList className="flex flex-col h-auto w-full md:w-64 bg-transparent gap-2 items-stretch justify-start p-0">
          <TabsTrigger value="general" className="justify-start gap-3 px-4 py-3 rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted/50 transition-all">
            <Globe size={18} className="opacity-70" /> General
          </TabsTrigger>
          <TabsTrigger value="branding" className="justify-start gap-3 px-4 py-3 rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted/50 transition-all">
            <Palette size={18} className="opacity-70" /> Branding
          </TabsTrigger>
          <TabsTrigger value="seo" className="justify-start gap-3 px-4 py-3 rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted/50 transition-all">
            <Search size={18} className="opacity-70" /> SEO
          </TabsTrigger>
          <TabsTrigger value="integrations" className="justify-start gap-3 px-4 py-3 rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted/50 transition-all">
            <Code size={18} className="opacity-70" /> Tracking
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 w-full min-w-0">
          {/* GENERAL TAB */}
          <TabsContent value="general" className="mt-0 outline-none">
          <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b bg-muted/10">
              <h3 className="font-semibold text-lg">Basic Information</h3>
              <p className="text-xs text-muted-foreground">This information is used throughout the website and email communications.</p>
            </div>
            <div className="p-6 space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">Site Name</label>
                  <Input value={settings.siteName || ""} onChange={e => update("siteName", e.target.value)} placeholder="e.g. HexaPixora" className="bg-background" />
                  <p className="text-[11px] text-muted-foreground">The public name of your business or project.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">Tagline</label>
                  <Input value={settings.tagline || ""} onChange={e => update("tagline", e.target.value)} placeholder="e.g. Modern Digital Agency" className="bg-background" />
                  <p className="text-[11px] text-muted-foreground">A short, catchy description displayed in the footer.</p>
                </div>
              </div>

              <div className="border-t pt-8">
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6">Contact Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2"><Mail size={14} className="text-primary"/> Business Email</label>
                    <Input type="email" value={settings.businessEmail || ""} onChange={e => update("businessEmail", e.target.value)} placeholder="hello@yourdomain.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2"><Phone size={14} className="text-primary"/> Business Phone</label>
                    <Input value={settings.businessPhone || ""} onChange={e => update("businessPhone", e.target.value)} placeholder="+1 (555) 000-0000" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold flex items-center gap-2"><MapPin size={14} className="text-primary"/> Office Address</label>
                    <Input value={settings.address || ""} onChange={e => update("address", e.target.value)} placeholder="123 Creative St, Tech City, Country" />
                  </div>
                </div>
              </div>

              <div className="border-t pt-8">
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6">Localization</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2"><Clock size={14} className="text-primary"/> Timezone</label>
                    <Input value={settings.timezone || ""} onChange={e => update("timezone", e.target.value)} placeholder="UTC+5:00" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2"><Map size={14} className="text-primary"/> Google Maps URL</label>
                    <Input value={settings.googleMapsUrl || ""} onChange={e => update("googleMapsUrl", e.target.value)} placeholder="https://maps.google.com/..." />
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </TabsContent>

        {/* BRANDING TAB */}
        <TabsContent value="branding" className="mt-0">
          <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b bg-muted/10">
              <h3 className="font-semibold text-lg">Visual Identity</h3>
              <p className="text-xs text-muted-foreground">Upload your brand assets to ensure consistency across the platform.</p>
            </div>
            <div className="p-6 space-y-6">
              <LogoUploader 
                field="logoUrl" 
                label="Logo" 
                description="This logo will be displayed in the website header, footer, and email templates. Use a transparent PNG or SVG."
              />
              <LogoUploader 
                field="faviconUrl" 
                label="Browser Favicon" 
                description="The small icon that appears in browser tabs and bookmarks. A square image (at least 32x32px) works best."
              />
            </div>
          </div>
        </TabsContent>

        {/* SEO TAB */}
        <TabsContent value="seo" className="mt-0">
          <div className="bg-card border rounded-2xl shadow-sm overflow-hidden p-6">
            <SeoTab
              values={{
                metaTitle: settings.seoTitle,
                metaDescription: settings.seoDescription,
                metaKeywords: settings.seoKeywords,
                ogImage: settings.ogImage,
              }}
              onChange={(field, value) => {
                const fieldMap: Record<string, string> = {
                  metaTitle: "seoTitle", metaDescription: "seoDescription",
                  metaKeywords: "seoKeywords", ogImage: "ogImage",
                };
                update(fieldMap[field] || field, value);
              }}
            />
          </div>
        </TabsContent>

        {/* INTEGRATIONS TAB */}
        <TabsContent value="integrations" className="mt-0">
          <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b bg-muted/10">
              <h3 className="font-semibold text-lg">Analytics & Tracking</h3>
              <p className="text-xs text-muted-foreground">Inject analytics scripts without touching code. These automatically apply to the entire site.</p>
            </div>
            <div className="p-6 space-y-6">
              
              <div className="p-5 border rounded-xl bg-background flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="h-12 w-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-sm font-semibold">Google Analytics 4 (GA4)</label>
                  <p className="text-xs text-muted-foreground">Track website traffic, user behavior, and conversions.</p>
                </div>
                <div className="w-full md:w-64">
                  <Input value={settings.googleAnalyticsId || ""} onChange={e => update("googleAnalyticsId", e.target.value)} placeholder="G-XXXXXXXXXX" />
                </div>
              </div>

              <div className="p-5 border rounded-xl bg-background flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="h-12 w-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-sm font-semibold">Google Tag Manager</label>
                  <p className="text-xs text-muted-foreground">Manage marketing tags and pixels seamlessly.</p>
                </div>
                <div className="w-full md:w-64">
                  <Input value={settings.gtmId || ""} onChange={e => update("gtmId", e.target.value)} placeholder="GTM-XXXXXXX" />
                </div>
              </div>

              <div className="p-5 border rounded-xl bg-background flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="h-12 w-12 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-sm font-semibold">Meta (Facebook) Pixel</label>
                  <p className="text-xs text-muted-foreground">Track ad conversions and build targeted audiences.</p>
                </div>
                <div className="w-full md:w-64">
                  <Input value={settings.metaPixelId || ""} onChange={e => update("metaPixelId", e.target.value)} placeholder="XXXXXXXXXXXXXXX" />
                </div>
              </div>

            </div>
          </div>
        </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
