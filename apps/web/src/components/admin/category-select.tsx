"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type Cat = { id: string; name: string; slug: string; color?: string | null };

/**
 * Multi-select of managed categories as toggleable chips. `by` controls what's
 * stored: "id" for blog posts (real relation) or "name" for the portfolio
 * module (presentational JSON). Selected values that no longer exist in the pool
 * are still shown so nothing silently disappears.
 */
export function CategorySelect({
  value,
  onChange,
  by = "id",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  by?: "id" | "name";
}) {
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/categories")
      .then((r) => setCats(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selected = Array.isArray(value) ? value : [];
  const toggle = (key: string) =>
    onChange(selected.includes(key) ? selected.filter((v) => v !== key) : [...selected, key]);

  if (loading) return <p className="text-xs text-muted-foreground">Loading categories…</p>;
  if (cats.length === 0)
    return (
      <p className="text-xs text-muted-foreground">
        No categories yet — create them in the Categories section.
      </p>
    );

  // Any stored value not present in the pool (e.g. a deleted category) — keep it visible.
  const known = new Set(cats.map((c) => (by === "name" ? c.name : c.id)));
  const orphans = selected.filter((v) => !known.has(v));

  return (
    <div className="flex flex-wrap gap-2">
      {cats.map((c) => {
        const key = by === "name" ? c.name : c.id;
        const on = selected.includes(key);
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => toggle(key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              on ? "border-primary bg-primary/10 text-primary" : "border-input text-muted-foreground hover:bg-muted/50",
            )}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color || "var(--color-muted-foreground)" }} />
            {c.name}
          </button>
        );
      })}
      {orphans.map((v) => (
        <button
          key={`orphan-${v}`}
          type="button"
          onClick={() => toggle(v)}
          className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 bg-destructive/5 px-3 py-1 text-xs font-medium text-destructive"
          title="This category no longer exists — click to remove"
        >
          {v} ✕
        </button>
      ))}
    </div>
  );
}
