"use client";

import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { useConfirm } from "@/components/admin/confirm-dialog";
import { useHasPermission } from "@/stores/use-auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GripVertical, Plus, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { revalidateCMS } from "@/actions/revalidate";

type MenuItem = {
  id: string;
  label: string;
  url: string;
  target: "_self" | "_blank";
  children: MenuItem[];
};

type Navigation = {
  id: string;
  name: string;
  items: MenuItem[];
};

const DEFAULT_MENU: MenuItem[] = [
  { id: "home", label: "Home", url: "/", target: "_self", children: [] },
  { id: "about", label: "About", url: "/about", target: "_self", children: [] },
  { id: "contact", label: "Contact", url: "/contact", target: "_self", children: [] },
];

const DEFAULT_NAVIGATIONS: Navigation[] = [
  { id: "main-menu", name: "Main Menu", items: DEFAULT_MENU },
  { id: "footer-legal", name: "Footer Legal", items: [{ id: "terms", label: "Terms", url: "/terms", target: "_self", children: [] }] }
];

const newId = () => `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

function MenuItemRow({ item, depth = 0, onUpdate, onDelete, onAddChild }: {
  item: MenuItem;
  depth?: number;
  onUpdate: (id: string, field: keyof MenuItem, value: any) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = item.children.length > 0;

  return (
    <div>
      <div className={`flex items-center gap-2 p-2 rounded-lg bg-background border hover:bg-muted/20 ${depth > 0 ? "ml-8 border-l-2 border-primary/30" : ""}`}>
        <GripVertical size={16} className="text-muted-foreground cursor-grab flex-shrink-0" />

        {hasChildren && (
          <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}
        {!hasChildren && <div className="w-4" />}

        <Input
          value={item.label}
          onChange={e => onUpdate(item.id, "label", e.target.value)}
          className="h-7 text-sm flex-1 bg-transparent"
          placeholder="Label"
        />
        <Input
          value={item.url}
          onChange={e => onUpdate(item.id, "url", e.target.value)}
          className="h-7 text-sm flex-1 bg-transparent text-muted-foreground"
          placeholder="/path"
        />
        <select
          value={item.target}
          onChange={e => onUpdate(item.id, "target", e.target.value)}
          className="h-7 text-xs bg-background border rounded px-1"
        >
          <option value="_self">Same tab</option>
          <option value="_blank">New tab</option>
        </select>

        {depth === 0 && (
          <Button variant="ghost" size="icon" className="h-7 w-7" title="Add sub-item" onClick={() => onAddChild(item.id)}>
            <Plus size={13} />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(item.id)}>
          <Trash2 size={13} />
        </Button>
      </div>

      {hasChildren && expanded && (
        <div className="mt-1 space-y-1">
          {item.children.map(child => (
            <MenuItemRow
              key={child.id}
              item={child}
              depth={depth + 1}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function NavigationsBuilderPage() {
  const confirm = useConfirm();
  const canManage = useHasPermission("layouts");
  const [navigations, setNavigations] = useState<Navigation[]>(DEFAULT_NAVIGATIONS);
  const [activeNavId, setActiveNavId] = useState<string>("main-menu");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    apiClient.get("/layouts/navigations").then(res => {
      if (res.data?.data?.length > 0) {
        setNavigations(res.data.data);
        setActiveNavId(res.data.data[0].id);
      }
    }).catch(() => {});
  }, []);

  const activeNav = navigations.find(n => n.id === activeNavId) || navigations[0];

  const updateActiveNav = (updatedItems: MenuItem[]) => {
    setNavigations(navigations.map(n => n.id === activeNavId ? { ...n, items: updatedItems } : n));
  };

  const renameActiveNav = (newName: string) => {
    setNavigations(navigations.map(n => n.id === activeNavId ? { ...n, name: newName } : n));
  };

  const createNav = () => {
    const id = `nav-${Date.now()}`;
    setNavigations([...navigations, { id, name: "New Menu", items: [] }]);
    setActiveNavId(id);
  };

  const deleteActiveNav = async () => {
    if (navigations.length <= 1) {
      toast.error("You must have at least one navigation menu.");
      return;
    }
    const ok = await confirm({
      title: "Delete menu?",
      description: "This navigation menu and its items will be removed.",
      confirmText: "Delete",
      destructive: true,
    });
    if (ok) {
      const remaining = navigations.filter(n => n.id !== activeNavId);
      setNavigations(remaining);
      setActiveNavId(remaining[0]?.id || "");
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !activeNav) return;
    const newItems = Array.from(activeNav.items);
    const [moved] = newItems.splice(result.source.index, 1);
    if (!moved) return;
    newItems.splice(result.destination.index, 0, moved);
    updateActiveNav(newItems);
  };

  const updateItem = (id: string, field: keyof MenuItem, value: any) => {
    if (!activeNav) return;
    const update = (list: MenuItem[]): MenuItem[] =>
      list.map(item =>
        item.id === id
          ? { ...item, [field]: value }
          : { ...item, children: update(item.children) }
      );
    updateActiveNav(update(activeNav.items));
  };

  const deleteItem = (id: string) => {
    if (!activeNav) return;
    const remove = (list: MenuItem[]): MenuItem[] =>
      list.filter(item => item.id !== id).map(item => ({ ...item, children: remove(item.children) }));
    updateActiveNav(remove(activeNav.items));
  };

  const addChild = (parentId: string) => {
    if (!activeNav) return;
    const add = (list: MenuItem[]): MenuItem[] =>
      list.map(item =>
        item.id === parentId
          ? { ...item, children: [...item.children, { id: newId(), label: "New Sub-item", url: "#", target: "_self", children: [] }] }
          : { ...item, children: add(item.children) }
      );
    updateActiveNav(add(activeNav.items));
  };

  const addTopLevel = () => {
    if (!activeNav) return;
    updateActiveNav([...activeNav.items, { id: newId(), label: "New Item", url: "/", target: "_self", children: [] }]);
  };

  const save = async () => {
    setSaving(true);
    try {
      await apiClient.put("/layouts/navigations", navigations);
      setSaved(true);
      await revalidateCMS();
      toast.success("Navigation saved");
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar: Navigations List */}
      <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Navigations</h1>
          <p className="text-sm text-muted-foreground mt-1">Create multiple menus to use in the Header and Footer.</p>
        </div>
        <div className="bg-card border rounded-xl overflow-hidden flex flex-col">
          {navigations.map(nav => (
            <button
              key={nav.id}
              onClick={() => setActiveNavId(nav.id)}
              className={`text-left px-4 py-3 text-sm font-medium transition-colors border-b last:border-b-0 ${
                activeNavId === nav.id ? "bg-primary/10 text-primary border-l-2 border-l-primary" : "hover:bg-muted"
              }`}
            >
              {nav.name}
            </button>
          ))}
          <div className="p-2 bg-muted/30">
            <Button variant="outline" size="sm" className="w-full border-dashed" onClick={createNav}>
              <Plus size={14} className="mr-2" /> New Menu
            </Button>
          </div>
        </div>
        {canManage && (
          <Button onClick={save} disabled={saving} className="w-full shadow-lg">
            {saved ? "✓ Saved All Menus!" : saving ? "Saving..." : "Save All Menus"}
          </Button>
        )}
      </div>

      {/* Main Panel: Builder */}
      {activeNav && (
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-card p-5 rounded-xl border flex flex-col gap-4">
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex-1 max-w-sm">
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Menu Name</label>
                <Input 
                  value={activeNav.name} 
                  onChange={e => renameActiveNav(e.target.value)} 
                  className="font-bold text-lg"
                />
              </div>
              <Button variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={deleteActiveNav}>
                <Trash2 size={16} className="mr-2" /> Delete Menu
              </Button>
            </div>

            <div className="min-h-[300px]">
              {activeNav.items.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                  This menu is empty. Add items to start building.
                </div>
              ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId={`menu-${activeNav.id}`}>
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {activeNav.items.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided) => (
                              <div 
                                ref={provided.innerRef} 
                                {...provided.draggableProps} 
                                {...provided.dragHandleProps}
                                style={provided.draggableProps.style as any}
                              >
                                <MenuItemRow
                                  item={item}
                                  onUpdate={updateItem}
                                  onDelete={deleteItem}
                                  onAddChild={addChild}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>

            <Button variant="outline" className="w-full mt-2 border-dashed" onClick={addTopLevel}>
              <Plus size={15} className="mr-2" /> Add Top-Level Item
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
