"use client";

import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { GripVertical, Eye, EyeOff, Settings2, LayoutDashboard, X } from "lucide-react";
import { MODULES, ModuleDefinition } from "@/lib/modules-registry";

type Section = {
  id: string;
  type: string;
  label: string;
  isVisible: boolean;
  config?: Record<string, any>;
};

const DEFAULT_SECTIONS: Section[] = [
  { id: "hero", type: "HeroSection", label: "Hero — Full-screen Hero with CTA", isVisible: true },
  { id: "stats", type: "StatsSection", label: "Stats — Key Numbers & Achievements", isVisible: true },
  { id: "services", type: "ServicesSection", label: "Services — Service Cards Grid", isVisible: true },
  { id: "about", type: "AboutSection", label: "About — Company Introduction", isVisible: true },
  { id: "portfolio", type: "PortfolioSection", label: "Portfolio — Recent Work Showcase", isVisible: true },
  { id: "process", type: "ProcessSection", label: "Process — How We Work", isVisible: true },
  { id: "testimonials", type: "TestimonialsSection", label: "Testimonials — Client Reviews", isVisible: true },
  { id: "team", type: "TeamSection", label: "Team — Meet the Team", isVisible: false },
  { id: "faq", type: "FAQSection", label: "FAQ — Frequently Asked Questions", isVisible: true },
  { id: "blog", type: "BlogSection", label: "Blog — Recent Articles", isVisible: true },
  { id: "cta", type: "CTASection", label: "CTA — Final Call to Action", isVisible: true },
];

export default function HomepageBuilderPage() {
  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS);
  const [moduleDefaults, setModuleDefaults] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Modals State
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [editingConfig, setEditingConfig] = useState<Record<string, any>>({});
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  
  const activeSection = sections.find(s => s.id === activeConfigId);
  const activeModuleDef = activeSection ? MODULES[activeSection.type] : null;

  React.useEffect(() => {
    // Fetch both the page layout and global module defaults
    Promise.all([
      apiClient.get("/layouts/homepage").catch(() => null),
      apiClient.get("/layouts/module-defaults").catch(() => null)
    ]).then(([layoutRes, defaultsRes]) => {
      if (layoutRes?.data?.data?.sections) setSections(layoutRes.data.data.sections);
      if (defaultsRes?.data?.data) setModuleDefaults(defaultsRes.data.data);
    });
  }, []);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newSections = Array.from(sections);
    const [moved] = newSections.splice(result.source.index, 1);
    if (!moved) return;
    newSections.splice(result.destination.index, 0, moved);
    setSections(newSections);
  };

  const toggle = (id: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, isVisible: !s.isVisible } : s));
  };

  const openSettings = (section: Section) => {
    setActiveConfigId(section.id);
    // If the section doesn't have custom config, show the global default or hardcoded default
    const globalDefault = moduleDefaults[section.type] || MODULES[section.type]?.defaultConfig || {};
    // Only pass existing config to editing config. Empty object means "use global default" when rendering
    setEditingConfig(section.config && Object.keys(section.config).length > 0 ? section.config : { ...globalDefault });
  };

  const saveSettings = () => {
    if (activeConfigId) {
      setSections(sections.map(s => s.id === activeConfigId ? { ...s, config: editingConfig } : s));
    }
    setActiveConfigId(null);
  };

  const save = async () => {
    setSaving(true);
    try {
      await apiClient.put("/layouts/homepage", { sections });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const removeSection = (id: string) => {
    if (confirm("Are you sure you want to remove this module from the page?")) {
      setSections(sections.filter(s => s.id !== id));
    }
  };

  const addModule = (type: string) => {
    const modDef = MODULES[type];
    if (!modDef) return;
    const newSection: Section = {
      id: `${type.toLowerCase()}-${Date.now()}`, // Unique ID
      type,
      label: modDef.label,
      isVisible: true,
      config: {} // Empty config means it will fall back to module-defaults
    };
    setSections([...sections, newSection]);
    setIsAddDrawerOpen(false);
  };

  const openPreview = () => {
    window.open("http://localhost:3000", "_blank");
  };

  const visibleCount = sections.filter(s => s.isVisible).length;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Homepage Builder</h1>
          <p className="text-muted-foreground">{visibleCount} of {sections.length} sections visible</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsAddDrawerOpen(true)}>
            + Add Module
          </Button>
          <Button variant="outline" onClick={openPreview}>
            <Eye size={15} className="mr-2" /> Preview Site
          </Button>
          <Button onClick={save} disabled={saving}>
            {saved ? "✓ Saved!" : saving ? "Saving..." : "Save Layout"}
          </Button>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-600 dark:text-amber-400 flex items-start gap-2">
        <LayoutDashboard size={16} className="mt-0.5 flex-shrink-0" />
        <span>Drag sections to reorder them. Toggle the eye icon to show or hide sections. Changes apply to the live site after saving.</span>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="homepage">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {sections.map((section, index) => (
                <Draggable key={section.id} draggableId={section.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={provided.draggableProps.style as any}
                      className={`flex items-center gap-3 bg-card border p-4 rounded-xl transition-all ${snapshot.isDragging ? "shadow-2xl scale-[1.02] rotate-1" : ""} ${!section.isVisible ? "opacity-50" : ""}`}
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="cursor-grab hover:text-primary text-muted-foreground flex-shrink-0"
                      >
                        <GripVertical size={20} />
                      </div>

                      <div className="flex-1">
                        <p className="font-medium text-sm">{section.label}</p>
                        <p className="text-xs text-muted-foreground font-mono">{section.type}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground mr-2">#{index + 1}</span>
                        {MODULES[section.type] && (
                          <button
                            onClick={() => openSettings(section)}
                            className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            title="Configure Section"
                          >
                            <Settings2 size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => toggle(section.id)}
                          className={`p-1.5 rounded-md transition-colors ${section.isVisible ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:bg-muted"}`}
                          title={section.isVisible ? "Click to hide" : "Click to show"}
                        >
                          {section.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button
                          onClick={() => removeSection(section.id)}
                          className="p-1.5 rounded-md text-red-500 hover:bg-red-500/10 transition-colors ml-1"
                          title="Remove Module"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="flex justify-center mt-4 border-t pt-6">
        <Button variant="outline" className="w-full border-dashed" onClick={() => setIsAddDrawerOpen(true)}>
          + Add New Module
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Hidden sections won't appear on the live site but won't be deleted.
      </p>

      {/* Dynamic Settings Modal */}
      <Dialog open={!!activeConfigId} onOpenChange={(open) => !open && setActiveConfigId(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {activeSection?.label}</DialogTitle>
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
            ) : (
              <p className="text-sm text-muted-foreground">No configurable settings for this module type yet.</p>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveConfigId(null)}>Cancel</Button>
            <Button onClick={saveSettings}>Apply Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Module Modal */}
      <Dialog open={isAddDrawerOpen} onOpenChange={setIsAddDrawerOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Module</DialogTitle>
            <p className="text-sm text-muted-foreground">Select a module to append to your page.</p>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {Object.values(MODULES).map(mod => (
              <div key={mod.type} className="border rounded-xl p-4 flex flex-col gap-2 hover:border-primary transition-colors cursor-pointer" onClick={() => addModule(mod.type)}>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 rounded-md text-primary">
                    <LayoutDashboard size={16} />
                  </div>
                  <h3 className="font-semibold">{mod.label}</h3>
                </div>
                <p className="text-xs text-muted-foreground">{mod.description}</p>
                <div className="mt-2 flex justify-end">
                  <Button size="sm" variant="secondary">Add</Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
