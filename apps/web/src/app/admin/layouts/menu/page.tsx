"use client";

import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GripVertical, Plus, Trash2, ChevronRight, ChevronDown, ExternalLink } from "lucide-react";

type MenuItem = {
  id: string;
  label: string;
  url: string;
  target: "_self" | "_blank";
  children: MenuItem[];
};

const DEFAULT_MENU: MenuItem[] = [
  { id: "home", label: "Home", url: "/", target: "_self", children: [] },
  { id: "about", label: "About", url: "/about", target: "_self", children: [] },
  {
    id: "services", label: "Services", url: "/services", target: "_self",
    children: [
      { id: "web-dev", label: "Web Development", url: "/services/web-development", target: "_self", children: [] },
      { id: "marketing", label: "Digital Marketing", url: "/services/digital-marketing", target: "_self", children: [] },
    ]
  },
  { id: "portfolio", label: "Portfolio", url: "/portfolio", target: "_self", children: [] },
  { id: "blog", label: "Blog", url: "/blog", target: "_self", children: [] },
  { id: "contact", label: "Contact", url: "/contact", target: "_self", children: [] },
];

let idCounter = 1000;
const newId = () => `item-${++idCounter}`;

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

export default function MegaMenuBuilderPage() {
  const [items, setItems] = useState<MenuItem[]>(DEFAULT_MENU);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showJson, setShowJson] = useState(false);

  React.useEffect(() => {
    apiClient.get("/layouts/mega-menu").then(res => {
      if (res.data?.data?.items) setItems(res.data.data.items);
    }).catch(() => {});
  }, []);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newItems = Array.from(items);
    const [moved] = newItems.splice(result.source.index, 1);
    if (!moved) return;
    newItems.splice(result.destination.index, 0, moved);
    setItems(newItems);
  };

  const updateItem = (id: string, field: keyof MenuItem, value: any) => {
    const update = (list: MenuItem[]): MenuItem[] =>
      list.map(item =>
        item.id === id
          ? { ...item, [field]: value }
          : { ...item, children: update(item.children) }
      );
    setItems(update(items));
  };

  const deleteItem = (id: string) => {
    const remove = (list: MenuItem[]): MenuItem[] =>
      list.filter(item => item.id !== id).map(item => ({ ...item, children: remove(item.children) }));
    setItems(remove(items));
  };

  const addChild = (parentId: string) => {
    const add = (list: MenuItem[]): MenuItem[] =>
      list.map(item =>
        item.id === parentId
          ? { ...item, children: [...item.children, { id: newId(), label: "New Sub-item", url: "#", target: "_self", children: [] }] }
          : { ...item, children: add(item.children) }
      );
    setItems(add(items));
  };

  const addTopLevel = () => {
    setItems([...items, { id: newId(), label: "New Item", url: "/", target: "_self", children: [] }]);
  };

  const save = async () => {
    setSaving(true);
    try {
      await apiClient.put("/layouts/mega-menu", { items });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex gap-6">
      {/* Builder Panel */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Mega Menu Builder</h1>
            <p className="text-muted-foreground">Drag to reorder. Add sub-items to create dropdowns.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowJson(!showJson)}>
              {showJson ? "Hide" : "View"} JSON
            </Button>
            <Button onClick={save} disabled={saving}>
              {saved ? "✓ Saved!" : saving ? "Saving..." : "Save Menu"}
            </Button>
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl border">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="mega-menu">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {items.map((item, index) => (
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

          <Button variant="outline" className="w-full mt-3 border-dashed" onClick={addTopLevel}>
            <Plus size={15} className="mr-2" /> Add Top-Level Item
          </Button>
        </div>
      </div>

      {/* JSON Preview Panel */}
      {showJson && (
        <div className="w-72 flex-shrink-0">
          <div className="bg-card border rounded-xl p-4 sticky top-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Live JSON Output</p>
            <pre className="text-xs overflow-auto max-h-[500px] text-green-400">
              {JSON.stringify(items, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
