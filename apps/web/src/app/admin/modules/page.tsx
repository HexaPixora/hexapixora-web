"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Settings2, Eye, Component, X } from "lucide-react";
import { MODULES, ModuleDefinition } from "@/lib/modules-registry";
import HeroModule from "@/components/modules/hero-module";
import CTAModule from "@/components/modules/cta-module";
import ServicesModule from "@/components/modules/services-module";
import PortfolioModule from "@/components/modules/portfolio-module";
import TestimonialsModule from "@/components/modules/testimonials-module";
import TeamModule from "@/components/modules/team-module";
import FAQModule from "@/components/modules/faq-module";
import StatsModule from "@/components/modules/stats-module";
import AboutModule from "@/components/modules/about-module";

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
};

export default function ModulesLibraryPage() {
  const [moduleDefaults, setModuleDefaults] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Modals state
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [editingConfig, setEditingConfig] = useState<Record<string, any>>({});
  const [previewId, setPreviewId] = useState<string | null>(null);

  const activeModuleDef = activeConfigId ? MODULES[activeConfigId] : null;

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
      setTimeout(() => setSaved(false), 3000);
      setActiveConfigId(null);
    } catch (err) {
      alert("Failed to save default content.");
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
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Global Defaults: {activeModuleDef?.label}</DialogTitle>
            <p className="text-xs text-muted-foreground">
              These settings will be used as a fallback if no specific content is provided in the page builder.
            </p>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {activeModuleDef ? (
              activeModuleDef.fields.map(field => (
                <div key={field.name} className="space-y-1.5">
                  <label className="text-sm font-medium">{field.label}</label>
                  {field.type === 'list' ? (
                    <div className="border rounded-md p-3 space-y-3 bg-muted/20">
                      {(editingConfig[field.name] || []).map((item: any, idx: number) => (
                        <div key={idx} className="border rounded bg-background p-3 relative space-y-3 group">
                          <button 
                            onClick={() => {
                              const newArray = [...(editingConfig[field.name] || [])];
                              newArray.splice(idx, 1);
                              setEditingConfig({ ...editingConfig, [field.name]: newArray });
                            }}
                            className="absolute top-2 right-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={16} />
                          </button>
                          {field.itemFields?.map(subField => (
                            <div key={subField.name} className="space-y-1">
                               <label className="text-xs font-medium">{subField.label}</label>
                               {subField.type === 'textarea' ? (
                                 <Textarea 
                                   value={item[subField.name] || ""} 
                                   onChange={e => {
                                     const newArray = [...(editingConfig[field.name] || [])];
                                     newArray[idx] = { ...newArray[idx], [subField.name]: e.target.value };
                                     setEditingConfig({ ...editingConfig, [field.name]: newArray });
                                   }}
                                   rows={2}
                                   className="text-sm"
                                 />
                               ) : (
                                 <Input 
                                   value={item[subField.name] || ""} 
                                   onChange={e => {
                                     const newArray = [...(editingConfig[field.name] || [])];
                                     newArray[idx] = { ...newArray[idx], [subField.name]: e.target.value };
                                     setEditingConfig({ ...editingConfig, [field.name]: newArray });
                                   }}
                                   className="h-8 text-sm"
                                 />
                               )}
                            </div>
                          ))}
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setEditingConfig({ ...editingConfig, [field.name]: [...(editingConfig[field.name] || []), {}] })}
                        className="w-full text-xs border-dashed"
                      >
                        + Add Item
                      </Button>
                    </div>
                  ) : field.type === 'textarea' ? (
                    <Textarea 
                      value={editingConfig[field.name] || ""} 
                      onChange={e => setEditingConfig({ ...editingConfig, [field.name]: e.target.value })}
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                      rows={4}
                    />
                  ) : field.type === 'color' ? (
                    <div className="flex gap-3">
                      <Input 
                        type="color" 
                        value={editingConfig[field.name] || "#000000"} 
                        onChange={e => setEditingConfig({ ...editingConfig, [field.name]: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input 
                        type="text" 
                        value={editingConfig[field.name] || ""} 
                        onChange={e => setEditingConfig({ ...editingConfig, [field.name]: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  ) : (
                    <Input 
                      type="text" 
                      value={editingConfig[field.name] || ""} 
                      onChange={e => setEditingConfig({ ...editingConfig, [field.name]: e.target.value })}
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    />
                  )}
                  {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
                </div>
              ))
            ) : null}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveConfigId(null)} disabled={saving}>Cancel</Button>
            <Button onClick={saveSettings} disabled={saving}>
              {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Defaults"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={!!previewId} onOpenChange={(open) => !open && setPreviewId(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto w-[90vw]">
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
