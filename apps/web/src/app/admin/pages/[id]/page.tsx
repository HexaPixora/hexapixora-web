"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { GripVertical, Eye, EyeOff, Settings2, LayoutDashboard, X, ArrowLeft, ToggleLeft, ToggleRight, Plus, Trash2, ExternalLink } from "lucide-react";
import { ModuleConfigForm } from "@/components/admin/module-config-form";
import MediaField from "@/components/admin/media-field";
import { MODULES, ModuleDefinition } from "@/lib/modules-registry";
import { revalidateCMS } from "@/actions/revalidate";
import { toast } from "sonner";
import { useConfirm } from "@/components/admin/confirm-dialog";
import { getDraftPreviewUrl } from "@/lib/preview-link";
import { StatusControl, ContentStatus } from "@/components/admin/status-control";
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
  status: ContentStatus;
  publishAt: string | null;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
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

  const [previewBusy, setPreviewBusy] = useState(false);

  const activeSection = sections.find(s => s.id === activeConfigId);
  const activeModuleDef = activeSection ? MODULES[activeSection.type] : null;

  useEffect(() => {
    Promise.all([
      // Admin endpoint returns the page regardless of publish status (so drafts load).
      apiClient.get(`/pages/admin/${id}`).catch(() => null),
      apiClient.get("/layouts/module-defaults").catch(() => null)
    ]).then(([pageRes, defaultsRes]) => {
      if (!pageRes?.data?.data) {
        toast.error("Page not found");
        router.push("/admin/pages");
        return;
      }

      const pData = pageRes.data.data;
      const loadedPage: PageData = {
        id: pData.id,
        title: pData.title || "",
        slug: pData.slug || "",
        showHeader: pData.showHeader ?? true,
        showFooter: pData.showFooter ?? true,
        status: (pData.status as ContentStatus) || "PUBLISHED",
        publishAt: pData.publishAt || null,
        metaTitle: pData.metaTitle || "",
        metaDescription: pData.metaDescription || "",
        ogImage: pData.ogImage || "",
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

  const save = async (opts: { silent?: boolean } = {}): Promise<boolean> => {
    if (!pageData) return false;
    setSaving(true);
    try {
      await apiClient.put(`/pages/${id}`, {
        ...pageData,
        sections
      });
      setSavedSnapshot(JSON.stringify({ page: pageData, sections }));
      setSaved(true);
      await revalidateCMS();
      if (!opts.silent) toast.success("Page saved");
      setTimeout(() => setSaved(false), 3000);
      return true;
    } catch (err: any) {
      toast.error("Save failed: " + (err.response?.data?.message || err.message));
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Build a Draft Mode preview URL, saving first so the render reflects the
  // latest edits (the iframe/tab shows server-rendered draft content).
  const resolvePreviewUrl = async (): Promise<string | null> => {
    if (!pageData) return null;
    if (isDirty && !(await save({ silent: true }))) return null;
    try {
      const url = await getDraftPreviewUrl(`/${pageData.slug}`);
      // Cache-bust so re-opening forces a fresh navigation.
      return `${url}&_=${Date.now()}`;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || "Preview unavailable");
      return null;
    }
  };

  const openPreviewTab = async () => {
    // Open the tab synchronously inside the click so the browser's popup blocker
    // allows it (opening it after the save/token awaits below gets blocked).
    const win = window.open("", "_blank");
    if (!win) {
      toast.error("Please allow pop-ups for this site to open the preview.");
      return;
    }
    setPreviewBusy(true);
    const url = await resolvePreviewUrl();
    setPreviewBusy(false);
    if (url) win.location.href = url;
    else win.close();
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

  if (loading) {
    return <div className="p-12 text-center text-muted-foreground">Loading Page Builder...</div>;
  }

  if (!pageData) return null;

  return (
    <div className="flex flex-col gap-6 mx-auto pb-12">
      <div className="sticky top-0 z-20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-background/90 backdrop-blur-md py-4 border-b rounded-md mx-4 md:px-4 sm:mx-0 px-0">
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
          <Button variant="outline" onClick={openPreviewTab} disabled={previewBusy} className="bg-background shadow-sm hover:border-primary">
            <ExternalLink size={16} className="mr-2" /> {previewBusy ? "Opening..." : "Preview"}
          </Button>
          {canManage && (
            <Button onClick={() => save()} disabled={saving} className="shadow-md">
              {saved ? "✓ Saved!" : saving ? "Saving..." : "Save Page"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Page Settings */}
        <div className="col-span-1 space-y-6">
          <div className="bg-card border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Publishing</h3>
            <StatusControl
              status={pageData.status}
              publishAt={pageData.publishAt}
              disabled={!canManage}
              onChange={(status, publishAt) => setPageData({ ...pageData, status, publishAt })}
            />
          </div>

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
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Featured / Social Image</label>
                <MediaField
                  type="image"
                  value={pageData.ogImage || ''}
                  onChange={(url) => setPageData({ ...pageData, ogImage: url })}
                />
                <p className="text-[11px] text-muted-foreground">
                  Shown as the preview thumbnail when this page is shared (Open Graph / Twitter).
                </p>
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
          
          <div className="py-4">
            <ModuleConfigForm def={activeModuleDef} value={editingConfig} onChange={setEditingConfig} />
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
