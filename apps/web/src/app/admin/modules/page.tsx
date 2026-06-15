"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { useHasPermission } from "@/stores/use-auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import MediaField from "@/components/admin/media-field";
import { Settings2, Eye, Component, X, ToggleLeft, ToggleRight } from "lucide-react";
import { MODULES, ModuleDefinition } from "@/lib/modules-registry";
import { revalidateCMS } from "@/actions/revalidate";
import HeroModule from "@/components/modules/hero-module";
import CTAModule from "@/components/modules/cta-module";
import ServicesModule from "@/components/modules/services-module";
import PortfolioModule from "@/components/modules/portfolio-module";
import TestimonialsModule from "@/components/modules/testimonials-module";
import TeamModule from "@/components/modules/team-module";
import FAQModule from "@/components/modules/faq-module";
import StatsModule from "@/components/modules/stats-module";
import AboutModule from "@/components/modules/about-module";
import SplideSliderModule from "@/components/modules/splide-slider-module";
import SplideLogoTickerModule from "@/components/modules/splide-logo-ticker-module";
import SplideTestimonialsModule from "@/components/modules/splide-testimonials-module";
import SplideGallerySyncModule from "@/components/modules/splide-gallery-sync-module";
import ContactFormModule from "@/components/modules/contact-form-module";
// Map for previews
const PREVIEW_MAP: Record<string, React.FC<any>> = {
  "HeroSection": HeroModule,
  "CTASection": CTAModule,
  "ServicesSection": ServicesModule,
  "PortfolioSection": PortfolioModule,
  "TestimonialsSection": TestimonialsModule,
  "TeamSection": TeamModule,
  "FAQSection": FAQModule,
  "StatsSection": StatsModule,
  "AboutSection": AboutModule,
  "SplideSliderModule": SplideSliderModule,
  "SplideLogoTickerModule": SplideLogoTickerModule,
  "SplideTestimonialsModule": SplideTestimonialsModule,
  "SplideGallerySyncModule": SplideGallerySyncModule,
  "ContactFormModule": ContactFormModule,
};

export default function ModulesLibraryPage() {
  const canManage = useHasPermission("layouts");
  const [moduleDefaults, setModuleDefaults] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Modals state
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [editingConfig, setEditingConfig] = useState<Record<string, any>>({});
  const [previewId, setPreviewId] = useState<string | null>(null);

  const activeModuleDef = activeConfigId ? MODULES[activeConfigId] : null;

  const renderFieldInput = (field: any, value: any, onChange: (val: any) => void, uploadKey?: string, itemName?: string) => {
    switch (field.type) {
      case 'textarea':
        return (
          <Textarea 
            value={value || ""} 
            onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            rows={field.name === 'content' || field.name === 'description' ? 4 : 2}
            className="text-sm"
          />
        );
      case 'color':
        return (
          <div className="flex gap-3">
            <Input 
              type="color" 
              value={value || "#000000"} 
              onChange={e => onChange(e.target.value)}
              className="w-16 h-10 p-1"
            />
            <Input 
              type="text" 
              value={value || ""} 
              onChange={e => onChange(e.target.value)}
              className="flex-1 font-mono"
            />
          </div>
        );
      case 'boolean':
        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChange(!value)}
              className="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-muted/50 transition-colors"
            >
              {value ? <ToggleRight className="text-primary" size={24} /> : <ToggleLeft className="text-muted-foreground" size={24} />}
              <span className="text-sm font-medium">{value ? "Enabled" : "Disabled"}</span>
            </button>
          </div>
        );
      case 'select':
        return (
          <select
            value={value || ""}
            onChange={e => onChange(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {field.options?.map((opt: any) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      case 'image':
      case 'video':
        return (
          <MediaField
            type={field.type}
            value={value || ""}
            onChange={onChange}
            placeholder={`URL or upload ${field.type}...`}
          />
        );
      case 'text':
      default:
        return (
          <Input 
            type="text" 
            value={value || ""} 
            onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className="text-sm"
          />
        );
    }
  };

  useEffect(() => {
    apiClient.get("/layouts/module-defaults").then(res => {
      if (res.data?.data) {
        setModuleDefaults(res.data.data);
      }
    }).catch(() => {});
  }, []);

  const openSettings = (moduleDef: ModuleDefinition) => {
    setActiveConfigId(moduleDef.type);
    const existingDefault = moduleDefaults[moduleDef.type];
    setEditingConfig(existingDefault || moduleDef.defaultConfig || {});
  };

  const saveSettings = async () => {
    if (!activeConfigId) return;
    
    setSaving(true);
    const updatedDefaults = {
      ...moduleDefaults,
      [activeConfigId]: editingConfig
    };
    
    try {
      await apiClient.put("/layouts/module-defaults", updatedDefaults);
      setModuleDefaults(updatedDefaults);
      setSaved(true);
      await revalidateCMS();
      toast.success("Default content saved");
      setTimeout(() => setSaved(false), 3000);
      setActiveConfigId(null);
    } catch (err) {
      toast.error("Failed to save default content.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Modules Library</h1>
          <p className="text-muted-foreground">Manage global default content for all builder components.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(MODULES).map((mod) => (
          <div key={mod.type} className="border rounded-xl p-5 bg-card flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Component size={20} />
              </div>
              <h3 className="font-semibold">{mod.label}</h3>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6 flex-1">
              {mod.description}
            </p>
            
            <div className="flex gap-2 mt-auto pt-4 border-t">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setPreviewId(mod.type)}>
                <Eye size={15} className="mr-2" /> Preview
              </Button>
              <Button variant="default" size="sm" className="flex-1" onClick={() => openSettings(mod)}>
                <Settings2 size={15} className="mr-2" /> Defaults
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Settings Modal */}
      <Dialog open={!!activeConfigId} onOpenChange={(open) => !open && setActiveConfigId(null)}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Global Defaults: {activeModuleDef?.label}</DialogTitle>
            <p className="text-xs text-muted-foreground">
              These settings will be used as a fallback if no specific content is provided in the page builder.
            </p>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {activeModuleDef ? (
              activeModuleDef.fields.map(field => (
                <div key={field.name} className="space-y-1.5 border-b pb-4 last:border-0">
                  <label className="text-sm font-semibold text-foreground/90">{field.label}</label>
                  {field.description && <p className="text-xs text-muted-foreground mb-2">{field.description}</p>}
                  
                  {field.type === 'list' ? (
                    <div className="border rounded-md p-3 space-y-3 bg-muted/10">
                      {(editingConfig[field.name] || []).map((item: any, idx: number) => (
                        <div key={idx} className="border rounded bg-card p-4 relative space-y-4 group shadow-sm">
                          <button 
                            onClick={() => {
                              const newArray = [...(editingConfig[field.name] || [])];
                              newArray.splice(idx, 1);
                              setEditingConfig({ ...editingConfig, [field.name]: newArray });
                            }}
                            className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity bg-background rounded-full p-1 border shadow-sm"
                            title="Remove Item"
                          >
                            <X size={14} />
                          </button>
                          
                          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 border-b pb-1">
                            Item {idx + 1}
                          </div>
                          
                          {field.itemFields?.map(subField => (
                            <div key={subField.name} className="space-y-1.5">
                               <label className="text-xs font-medium text-foreground/80">{subField.label}</label>
                               {renderFieldInput(
                                 subField, 
                                 item[subField.name], 
                                 (val) => {
                                   const newArray = [...(editingConfig[field.name] || [])];
                                   newArray[idx] = { ...newArray[idx], [subField.name]: val };
                                   setEditingConfig({ ...editingConfig, [field.name]: newArray });
                                 },
                                 `${field.name}-${idx}`,
                                 subField.name
                               )}
                            </div>
                          ))}
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setEditingConfig({ ...editingConfig, [field.name]: [...(editingConfig[field.name] || []), {}] })}
                        className="w-full text-xs border-dashed hover:border-primary hover:text-primary transition-colors mt-2"
                      >
                        + Add New {field.label.replace(/s$/, '')}
                      </Button>
                    </div>
                  ) : (
                    renderFieldInput(
                      field, 
                      editingConfig[field.name], 
                      (val) => setEditingConfig({ ...editingConfig, [field.name]: val }),
                      field.name
                    )
                  )}
                </div>
              ))
            ) : null}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveConfigId(null)} disabled={saving}>Cancel</Button>
            {canManage && (
              <Button onClick={saveSettings} disabled={saving}>
                {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Defaults"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={!!previewId} onOpenChange={(open) => !open && setPreviewId(null)}>
        <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto w-[90vw]">
          <DialogHeader>
            <DialogTitle>Preview: {previewId ? MODULES[previewId]?.label : ''}</DialogTitle>
          </DialogHeader>
          <div className="border rounded-xl overflow-hidden mt-4 bg-background">
            {previewId && PREVIEW_MAP[previewId] ? (
              React.createElement(PREVIEW_MAP[previewId], {
                config: moduleDefaults[previewId] || MODULES[previewId]?.defaultConfig
              })
            ) : (
              <div className="p-12 text-center text-muted-foreground bg-muted/30">
                <p>Preview not available yet.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
