"use client";

import React from "react";
import type { ModuleDefinition, ModuleField } from "@/lib/modules-registry";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import MediaField from "@/components/admin/media-field";
import { CategorySelect } from "@/components/admin/category-select";
import { ToggleLeft, ToggleRight, Trash2 } from "lucide-react";

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

/** Renders a single module field control (no list — lists are handled by ListEditor). */
function FieldControl({
  field,
  value,
  onChange,
}: {
  field: ModuleField;
  value: any;
  onChange: (val: any) => void;
}) {
  switch (field.type) {
    case "textarea":
    case "richtext":
      return (
        <Textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          rows={field.name === "content" || field.name === "description" ? 4 : 2}
          className="text-sm"
        />
      );
    case "color":
      return (
        <div className="flex gap-3">
          <Input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)} className="h-10 w-16 p-1" />
          <Input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} className="flex-1 font-mono" />
        </div>
      );
    case "boolean":
      return (
        <button
          type="button"
          onClick={() => onChange(!value)}
          className="flex items-center gap-2 rounded-md border px-3 py-2 transition-colors hover:bg-muted/50"
        >
          {value ? <ToggleRight className="text-primary" size={24} /> : <ToggleLeft className="text-muted-foreground" size={24} />}
          <span className="text-sm font-medium">{value ? "Enabled" : "Disabled"}</span>
        </button>
      );
    case "select":
      return (
        <select value={value || ""} onChange={(e) => onChange(e.target.value)} className={SELECT_CLASS}>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    case "image":
    case "video":
      return <MediaField type={field.type} value={value || ""} onChange={onChange} placeholder={`URL or upload ${field.type}...`} />;
    case "categories":
      // Stores an array of category NAMES from the shared pool (presentational).
      return <CategorySelect by="name" value={Array.isArray(value) ? value : []} onChange={onChange} />;
    case "text":
    default:
      return (
        <Input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          className="text-sm"
        />
      );
  }
}

/** Repeatable list of objects, each shaped by `field.itemFields`. */
function ListEditor({
  field,
  items,
  onItems,
}: {
  field: ModuleField;
  items: any[];
  onItems: (next: any[]) => void;
}) {
  const singular = field.label.replace(/s$/, "");
  return (
    <div className="space-y-4 rounded-lg border-2 border-dashed bg-muted/5 p-4">
      {items.map((item, idx) => (
        <div key={idx} className="group relative space-y-4 rounded-xl border bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
          <div className="mb-1 flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] text-primary">{idx + 1}</span>
              {singular}
            </div>
            <button
              onClick={() => onItems(items.filter((_, i) => i !== idx))}
              className="rounded-md bg-background p-1.5 text-muted-foreground opacity-0 transition-colors hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
              title="Remove item"
            >
              <Trash2 size={14} />
            </button>
          </div>
          {field.itemFields?.map((subField) => (
            <div key={subField.name} className="space-y-1.5">
              <label className="text-xs font-medium text-foreground/80">{subField.label}</label>
              <FieldControl
                field={subField as ModuleField}
                value={item[subField.name]}
                onChange={(val) => onItems(items.map((it, i) => (i === idx ? { ...it, [subField.name]: val } : it)))}
              />
            </div>
          ))}
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onItems([...items, {}])}
        className="mt-2 w-full border-dashed text-xs transition-colors hover:border-primary hover:text-primary"
      >
        + Add New {singular}
      </Button>
    </div>
  );
}

/**
 * Renders the editable form for a module's config based on its registry
 * definition. Single source of truth for the page builder, homepage builder,
 * and the module-defaults library (previously triplicated as `renderFieldInput`).
 */
export function ModuleConfigForm({
  def,
  value,
  onChange,
  emptyText = "No configurable settings for this module type yet.",
}: {
  def?: ModuleDefinition | null;
  value: Record<string, any>;
  onChange: (next: Record<string, any>) => void;
  emptyText?: string;
}) {
  if (!def) return <p className="text-sm text-muted-foreground">{emptyText}</p>;

  const set = (name: string, val: any) => onChange({ ...value, [name]: val });

  return (
    <div className="space-y-4">
      {def.fields.map((field) => (
        <div key={field.name} className="space-y-1.5 border-b pb-4 last:border-0">
          <label className="text-sm font-semibold text-foreground/90">{field.label}</label>
          {field.description && <p className="mb-2 text-xs text-muted-foreground">{field.description}</p>}
          {field.type === "list" ? (
            <ListEditor field={field} items={value[field.name] || []} onItems={(arr) => set(field.name, arr)} />
          ) : (
            <FieldControl field={field} value={value[field.name]} onChange={(val) => set(field.name, val)} />
          )}
        </div>
      ))}
    </div>
  );
}
