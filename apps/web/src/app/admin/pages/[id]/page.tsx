"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { GripVertical, Eye, EyeOff, Settings2, LayoutDashboard, X, ArrowLeft, ToggleLeft, ToggleRight, Plus, Trash2 } from "lucide-react";
import MediaField from "@/components/admin/media-field";
import { MODULES, ModuleDefinition } from "@/lib/modules-registry";
import { revalidateCMS } from "@/actions/revalidate";
import { toast } from "sonner";
import { useConfirm } from "@/components/admin/confirm-dialog";
import { siteUrl } from "@/lib/site-url";
import { useUnsavedChanges } from "@/lib/use-unsaved-changes";
import { useHasPermission } from "@/stores/use-auth-store";

type Section = {
  id: string;
  type: string;
  label: string;
  isVisible: boolean;
  config?: Record<string, any>;
};

type PageData = {
  id: string;
  title: string;
  slug: string;
  showHeader: boolean;
  showFooter: boolean;
  metaTitle: string;
  metaDescription: string;
};

export default function CustomPageBuilderPage() {
  const { id } = useParams();
  const router = useRouter();
  const confirm = useConfirm();
  const canManage = useHasPermission("pages");

  const [pageData, setPageData] = useState<PageData | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [moduleDefaults, setModuleDefaults] = useState<Record<string, any>>({});
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState<string>("");
  
  // Modals State
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [editingConfig, setEditingConfig] = useState<Record<string, any>>({});
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

  const activeSection = sections.find(s => s.id === activeConfigId);
  const activeModuleDef = activeSection ? MODULES[activeSection.type] : null;

  useEffect(() => {
    Promise.all([
      apiClient.get(`/pages/${id}`).catch(() => null),
      apiClient.get("/layouts/module-defaults").catch(() => null)
    ]).then(([pageRes, defaultsRes]) => {
      if (!pageRes?.data?.data) {
        toast.error("Page not found");
        router.push("/admin/pages");
        return;
      }
      
      const pData = pageRes.data.data;
      const loadedPage = {
        id: pData.id,
        title: pData.title || "",
        slug: pData.slug || "",
        showHeader: pData.showHeader ?? true,
        showFooter: pData.showFooter ?? true,
        metaTitle: pData.metaTitle || "",
        metaDescription: pData.metaDescription || "",
      };
      setPageData(loadedPage);

      let parsedSections = [];
      try {
        parsedSections = typeof pData.sections === 'string' ? JSON.parse(pData.sections) : pData.sections;
        if (!Array.isArray(parsedSections)) parsedSections = [];
      } catch(e) {}

      setSections(parsedSections);
      setSavedSnapshot(JSON.stringify({ page: loadedPage, sections: parsedSections }));

      if (defaultsRes?.data?.data) {
        setModuleDefaults(defaultsRes.data.data);
      }
      setLoading(false);
    });
  }, [id, router]);

  const isDirty =
    !loading && !!pageData &&
    savedSnapshot !== JSON.stringify({ page: pageData, sections });
  useUnsavedChanges(isDirty);

  const goBack = async () => {
    if (isDirty) {
      const ok = await confirm({
        title: "Discard unsaved changes?",
        description: "You have unsaved changes that will be lost if you leave.",
        confirmText: "Discard",
        destructive: true,
      });
      if (!ok) return;
    }
    router.push("/admin/pages");
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newSections = Array.from(sections);
    const [moved] = newSections.splice(result.source.index, 1);
    if (!moved) return;
    newSections.splice(result.destination.index, 0, moved);
    setSections(newSections);
  };

  const toggle = (sid: string) => {
    setSections(sections.map(s => s.id === sid ? { ...s, isVisible: !s.isVisible } : s));
  };

  const openSettings = (section: Section) => {
    setActiveConfigId(section.id);
    const globalDefault = moduleDefaults[section.type] || MODULES[section.type]?.defaultConfig || {};
    setEditingConfig(section.config && Object.keys(section.config).length > 0 ? section.config : { ...globalDefault });
  };

  const saveSettings = () => {
    if (activeConfigId) {
      setSections(sections.map(s => s.id === activeConfigId ? { ...s, config: editingConfig } : s));
    }
    setActiveConfigId(null);
  };

  const save = async () => {
    if (!pageData) return;
    setSaving(true);
    try {
      await apiClient.put(`/pages/${id}`, {
        ...pageData,
        sections
      });
      setSavedSnapshot(JSON.stringify({ page: pageData, sections }));
      setSaved(true);
      await revalidateCMS();
      toast.success("Page saved");
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      toast.error("Save failed: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const removeSection = async (sid: string) => {
    const ok = await confirm({
      title: "Remove module?",
      description: "This module will be removed from the page.",
      confirmText: "Remove",
      destructive: true,
    });
    if (ok) {
      setSections(sections.filter(s => s.id !== sid));
    }
  };

  const addModule = (type: string) => {
    const modDef = MODULES[type];
    if (!modDef) return;
    const newSection: Section = {
      id: `${type.toLowerCase()}-${Date.now()}`,
      type,
      label: modDef.label,
      isVisible: true,
      config: {}
    };
    setSections([...sections, newSection]);
    setIsAddDrawerOpen(false);
  };

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

  if (loading) {
    return <div className="p-12 text-center text-muted-foreground">Loading Page Builder...</div>;
  }

  if (!pageData) return null;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      <div className="sticky top-0 z-20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-background/90 backdrop-blur-md py-4 border-b -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="p-2 hover:bg-muted rounded-md text-muted-foreground transition-colors border bg-card hover:text-foreground shadow-sm">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">Edit Page</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {sections.length} modules
              {isDirty && <span className="ml-2 text-amber-600 dark:text-amber-400 font-medium">• Unsaved changes</span>}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {!canManage && (
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-md">View only</span>
          )}
          {canManage && (
            <Button variant="outline" onClick={() => setIsAddDrawerOpen(true)} className="bg-background shadow-sm hover:border-primary">
              <Plus size={16} className="mr-2" /> Add Module
            </Button>
          )}
          <a href={siteUrl(pageData.slug)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            <Eye size={16} className="mr-2" /> Preview
          </a>
          {canManage && (
            <Button onClick={save} disabled={saving} className="shadow-md">
              {saved ? "✓ Saved!" : saving ? "Saving..." : "Save Page"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Page Settings */}
        <div className="col-span-1 space-y-6">
          <div className="bg-card border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Page Settings</h3>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Page Title</label>
              <Input 
                value={pageData.title} 
                onChange={e => setPageData({ ...pageData, title: e.target.value })} 
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium">URL Slug</label>
              <Input 
                value={pageData.slug} 
                onChange={e => setPageData({ ...pageData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-') })} 
              />
            </div>

            <div className="pt-2 space-y-3 border-t">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground">Show Header</label>
                <button onClick={() => setPageData({ ...pageData, showHeader: !pageData.showHeader })} className={pageData.showHeader ? 'text-primary' : 'text-muted-foreground'}>
                  {pageData.showHeader ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground">Show Footer</label>
                <button onClick={() => setPageData({ ...pageData, showFooter: !pageData.showFooter })} className={pageData.showFooter ? 'text-primary' : 'text-muted-foreground'}>
                  {pageData.showFooter ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
              </div>
            </div>

            <div className="pt-2 space-y-4 border-t">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">SEO Settings</h4>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Meta Title</label>
                <Input 
                  value={pageData.metaTitle || ''} 
                  onChange={e => setPageData({ ...pageData, metaTitle: e.target.value })} 
                  placeholder={pageData.title}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Meta Description</label>
                <Textarea 
                  value={pageData.metaDescription || ''} 
                  onChange={e => setPageData({ ...pageData, metaDescription: e.target.value })} 
                  rows={3}
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Module Builder */}
        <div className="col-span-2">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-600 dark:text-amber-400 flex items-start gap-2 mb-4">
            <LayoutDashboard size={16} className="mt-0.5 flex-shrink-0" />
            <span>Drag sections to reorder them. Toggle the eye icon to show or hide sections. Changes apply to the live site after saving.</span>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="page-builder">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {sections.map((section, index) => (
                    <Draggable key={section.id} draggableId={section.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={provided.draggableProps.style as any}
                          className={`group flex items-center gap-4 bg-card border border-l-4 ${section.isVisible ? 'border-l-primary' : 'border-l-muted-foreground/30 opacity-60'} p-4 rounded-xl transition-all hover:shadow-md hover:border-primary/50 ${snapshot.isDragging ? "shadow-2xl scale-[1.02] rotate-1 z-50 border-primary" : ""}`}
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab hover:text-primary text-muted-foreground/50 hover:bg-muted p-1.5 rounded-md flex-shrink-0 transition-colors"
                          >
                            <GripVertical size={20} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{section.label}</p>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">{section.type}</p>
                          </div>

                          <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-1 rounded-md mr-2 hidden sm:inline-block">#{index + 1}</span>
                            {MODULES[section.type] && (
                              <button
                                onClick={() => openSettings(section)}
                                className="p-2 rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                                title="Configure Section"
                              >
                                <Settings2 size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => toggle(section.id)}
                              className={`p-2 rounded-md transition-colors ${section.isVisible ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:bg-muted"}`}
                              title={section.isVisible ? "Click to hide" : "Click to show"}
                            >
                              {section.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                            </button>
                            <button
                              onClick={() => removeSection(section.id)}
                              className="p-2 rounded-md text-red-500 hover:bg-red-500/10 transition-colors ml-1"
                              title="Remove Module"
                            >
                              <Trash2 size={16} />
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
          
          {sections.length === 0 && (
            <div className="mt-6 p-12 border-2 border-dashed rounded-xl text-center text-muted-foreground">
              This page is empty. Add modules to start building.
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Settings Modal */}
      <Dialog open={!!activeConfigId} onOpenChange={(open) => !open && setActiveConfigId(null)}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {activeSection?.label}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {activeModuleDef ? (
              activeModuleDef.fields.map(field => (
                <div key={field.name} className="space-y-1.5 border-b pb-4 last:border-0">
                  <label className="text-sm font-semibold text-foreground/90">{field.label}</label>
                  {field.description && <p className="text-xs text-muted-foreground mb-2">{field.description}</p>}
                  
                  {field.type === 'list' ? (
                    <div className="border-2 border-dashed rounded-lg p-4 space-y-4 bg-muted/5">
                      {(editingConfig[field.name] || []).map((item: any, idx: number) => (
                        <div key={idx} className="border rounded-xl bg-card p-5 relative space-y-4 group shadow-sm transition-all hover:shadow-md hover:border-primary/30">
                          <div className="flex items-center justify-between border-b pb-3 mb-1">
                            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px]">{idx + 1}</span>
                              {field.label.replace(/s$/, '')}
                            </div>
                            <button 
                              onClick={() => {
                                const newArray = [...(editingConfig[field.name] || [])];
                                newArray.splice(idx, 1);
                                setEditingConfig({ ...editingConfig, [field.name]: newArray });
                              }}
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors bg-background rounded-md p-1.5 opacity-0 group-hover:opacity-100"
                              title="Remove Item"
                            >
                              <Trash2 size={14} />
                            </button>
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
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Module</DialogTitle>
            <p className="text-sm text-muted-foreground">Select a module to append to your page.</p>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            {Object.values(MODULES).map(mod => (
              <div key={mod.type} className="group border rounded-xl p-5 flex flex-col gap-3 hover:border-primary hover:shadow-md hover:bg-primary/5 transition-all cursor-pointer relative overflow-hidden" onClick={() => addModule(mod.type)}>
                <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="p-2 bg-background border rounded-lg text-primary shadow-sm group-hover:scale-110 transition-transform">
                    <LayoutDashboard size={18} />
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{mod.label}</h3>
                </div>
                <p className="text-xs text-muted-foreground relative z-10 leading-relaxed">{mod.description}</p>
                <div className="mt-auto pt-2 flex justify-end relative z-10">
                  <span className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <Plus size={14} /> Add Module
                  </span>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
