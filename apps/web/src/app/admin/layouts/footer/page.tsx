"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

type FooterLink = {
  id: string;
  label: string;
  url: string;
};

type FooterData = {
  quickLinks: FooterLink[];
  legalLinks: FooterLink[];
};

const DEFAULT_FOOTER: FooterData = {
  quickLinks: [
    { id: "home", label: "Home", url: "/" },
    { id: "about", label: "About Us", url: "/about" },
    { id: "services", label: "Services", url: "/services" },
    { id: "portfolio", label: "Portfolio", url: "/portfolio" },
    { id: "blog", label: "Blog", url: "/blog" },
  ],
  legalLinks: [
    { id: "privacy", label: "Privacy Policy", url: "/privacy" },
    { id: "terms", label: "Terms of Service", url: "/terms" },
    { id: "cookies", label: "Cookie Policy", url: "/cookies" },
  ],
};

let idCounter = 1000;
const newId = () => `footer-item-${++idCounter}`;

export default function FooterBuilderPage() {
  const [data, setData] = useState<FooterData>(DEFAULT_FOOTER);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiClient.get("/layouts/footer").then(res => {
      if (res.data?.data) {
        setData({
          quickLinks: res.data.data.quickLinks || DEFAULT_FOOTER.quickLinks,
          legalLinks: res.data.data.legalLinks || DEFAULT_FOOTER.legalLinks,
        });
      }
    }).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await apiClient.put("/layouts/footer", data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const onDragEnd = (result: DropResult, listKey: keyof FooterData) => {
    if (!result.destination) return;
    const newItems = Array.from(data[listKey]);
    const [moved] = newItems.splice(result.source.index, 1);
    if (!moved) return;
    newItems.splice(result.destination.index, 0, moved);
    setData({ ...data, [listKey]: newItems });
  };

  const updateItem = (listKey: keyof FooterData, id: string, field: keyof FooterLink, value: string) => {
    setData({
      ...data,
      [listKey]: data[listKey].map(item => item.id === id ? { ...item, [field]: value } : item)
    });
  };

  const deleteItem = (listKey: keyof FooterData, id: string) => {
    setData({
      ...data,
      [listKey]: data[listKey].filter(item => item.id !== id)
    });
  };

  const addItem = (listKey: keyof FooterData) => {
    setData({
      ...data,
      [listKey]: [...data[listKey], { id: newId(), label: "New Link", url: "/" }]
    });
  };

  const ListBuilder = ({ title, listKey }: { title: string, listKey: keyof FooterData }) => (
    <div className="bg-card p-5 rounded-xl border space-y-4">
      <h3 className="font-semibold">{title}</h3>
      <DragDropContext onDragEnd={(res) => onDragEnd(res, listKey)}>
        <Droppable droppableId={`droppable-${listKey}`}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {data[listKey].map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided) => (
                    <div 
                      ref={provided.innerRef} 
                      {...provided.draggableProps} 
                      style={provided.draggableProps.style as any}
                      className="flex items-center gap-3 p-2 bg-background border rounded-lg"
                    >
                      <div {...provided.dragHandleProps} className="cursor-grab text-muted-foreground flex-shrink-0">
                        <GripVertical size={16} />
                      </div>
                      <Input
                        value={item.label}
                        onChange={e => updateItem(listKey, item.id, "label", e.target.value)}
                        className="h-8 text-sm flex-1 bg-transparent"
                        placeholder="Link Label"
                      />
                      <Input
                        value={item.url}
                        onChange={e => updateItem(listKey, item.id, "url", e.target.value)}
                        className="h-8 text-sm flex-1 bg-transparent text-muted-foreground"
                        placeholder="/path"
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteItem(listKey, item.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <Button variant="outline" size="sm" className="w-full border-dashed" onClick={() => addItem(listKey)}>
        <Plus size={14} className="mr-2" /> Add Link
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Footer Builder</h1>
          <p className="text-muted-foreground">Manage the Quick Links and Legal Links displayed in the site footer.</p>
        </div>
        <Button onClick={save} disabled={saving}>
          {saved ? "✓ Saved!" : saving ? "Saving..." : "Save Footer"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ListBuilder title="Quick Links" listKey="quickLinks" />
        <ListBuilder title="Legal Links" listKey="legalLinks" />
      </div>
      
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-sm text-amber-600 dark:text-amber-400">
        <p className="font-semibold mb-1">Note regarding other footer items:</p>
        <ul className="list-disc pl-5 space-y-1 opacity-90">
          <li><strong>Logo, Tagline, and Social Links</strong> are managed in the <a href="/admin/settings" className="underline hover:text-amber-700 dark:hover:text-amber-300">Global Settings</a> area.</li>
          <li><strong>Contact Info (Email, Phone, Address)</strong> is also managed in the <a href="/admin/settings" className="underline hover:text-amber-700 dark:hover:text-amber-300">Global Settings</a> area.</li>
          <li>The copyright year updates automatically.</li>
        </ul>
      </div>
    </div>
  );
}
