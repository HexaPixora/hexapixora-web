"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { GripVertical, Eye, EyeOff, Settings2, LayoutDashboard, X, ArrowLeft, ToggleLeft, ToggleRight, Upload, Loader2 } from "lucide-react";
import { MODULES, ModuleDefinition } from "@/lib/modules-registry";
import { revalidateCMS } from "@/actions/revalidate";
import Link from "next/link";

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
  
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [moduleDefaults, setModuleDefaults] = useState<Record<string, any>>({});
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Modals State
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [editingConfig, setEditingConfig] = useState<Record<string, any>>({});
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  
  const activeSection = sections.find(s => s.id === activeConfigId);
  const activeModuleDef = activeSection ? MODULES[activeSection.type] : null;

  useEffect(() => {
    Promise.all([
      apiClient.get(`/pages/${id}`).catch(() => null),
      apiClient.get("/layouts/module-defaults").catch(() => null)
    ]).then(([pageRes, defaultsRes]) => {
      if (!pageRes?.data?.data) {
        alert("Page not found");
        router.push("/admin/pages");
        return;
      }
      
      const pData = pageRes.data.data;
      setPageData({
        id: pData.id,
        title: pData.title || "",
        slug: pData.slug || "",
        showHeader: pData.showHeader ?? true,
        showFooter: pData.showFooter ?? true,
        metaTitle: pData.metaTitle || "",
        metaDescription: pData.metaDescription || "",
      });
      
      let parsedSections = [];
      try {
        parsedSections = typeof pData.sections === 'string' ? JSON.parse(pData.sections) : pData.sections;
        if (!Array.isArray(parsedSections)) parsedSections = [];
      } catch(e) {}
      
      setSections(parsedSections);
      
      if (defaultsRes?.data?.data) {
        setModuleDefaults(defaultsRes.data.data);
      }
      setLoading(false);
    });
  }, [id, router]);

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
      setSaved(true);
      await revalidateCMS();
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert("Save failed: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const removeSection = (sid: string) => {
    if (confirm("Are you sure you want to remove this module from the page?")) {
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

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, uploadKey: string | undefined, onChange: (val: string) => void) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    if (uploadKey) setUploadingField(uploadKey);

    try {
      const res = await apiClient.post("/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      onChange(res.data.url);
    } catch (err) {
      alert("Failed to upload file.");
    } finally {
      if (uploadKey) setUploadingField(null);
    }
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
          <div className="flex items-center gap-3">
            <Input 
              type="text" 
              value={value || ""} 
              onChange={e => onChange(e.target.value)}
              placeholder={`URL or upload ${field.type}...`}
              className="flex-1 text-sm font-mono"
            />
            <div className="relative">
              <input 
                type="file" 
                name={itemName}
                accept={field.type === 'image' ? "image/*" : "video/*"}
                onChange={e => handleMediaUpload(e, uploadKey, onChange)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploadingField === uploadKey}
              />
              <Button type="button" variant="secondary" size="icon" disabled={uploadingField === uploadKey}>
                {uploadingField === uploadKey ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              </Button>
            </div>
            {value && field.type === 'image' && (
              <img src={value} alt="Preview" className="h-10 w-10 object-cover rounded border" />
            )}
          </div>
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
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/admin/pages" className="p-2 hover:bg-muted rounded-md text-muted-foreground transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Edit Page</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsAddDrawerOpen(true)}>
            + Add Module
          </Button>
          <a href={`http://localhost:3000/${pageData.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            <Eye size={15} className="mr-2" /> Preview
          </a>
          <Button onClick={save} disabled={saving}>
            {saved ? "✓ Saved!" : saving ? "Saving..." : "Save Page"}
          </Button>
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
                <button onClick={() => setPageData({ ...pageData, showHeader: !pageData.showHeader })} className={`text-${pageData.showHeader ? 'primary' : 'muted-foreground'}`}>
                  {pageData.showHeader ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground">Show Footer</label>
                <button onClick={() => setPageData({ ...pageData, showFooter: !pageData.showFooter })} className={`text-${pageData.showFooter ? 'primary' : 'muted-foreground'}`}>
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
          
          {sections.length === 0 && (
            <div className="mt-6 p-12 border-2 border-dashed rounded-xl text-center text-muted-foreground">
              This page is empty. Add modules to start building.
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Settings Modal */}
      <Dialog open={!!activeConfigId} onOpenChange={(open) => !open && setActiveConfigId(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
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
                    <div className="border rounded-md p-3 space-y-3 bg-muted/10">
                      {(editingConfig[field.name] || []).map((item: any, idx: number) => (
                        <div key={idx} className="border rounded bg-card p-4 relative space-y-4 group shadow-sm">
                          <button 
                            onClick={() => {
                              const newArray = [...(editingConfig[field.name] || [])];
                              newArray.splice(idx, 1);
                              setEditingConfig({ ...editingConfig, [field.name]: newArray });
                            }}
                            className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity bg-background rounded-full p-1 border shadow-sm z-10"
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
