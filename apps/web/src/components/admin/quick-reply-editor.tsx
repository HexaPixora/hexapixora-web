"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Zap, Bot, CornerDownRight, GripVertical } from "lucide-react";

export interface QuickReply {
  label: string;
  reply?: string;
  children?: QuickReply[];
}

const INPUT =
  "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30";

const MAX_DEPTH = 2; // 0,1,2 → up to 3 nested levels

/**
 * Recursive editor for the quick-reply chip tree. A chip with children acts as
 * a clarifying menu (clicking it drills into sub-questions); a leaf chip can
 * carry a canned answer or fall back to the AI.
 */
export default function QuickReplyEditor({
  value,
  onChange,
  depth = 0,
}: {
  value: QuickReply[];
  onChange: (next: QuickReply[]) => void;
  depth?: number;
}) {
  const items = value || [];
  const update = (i: number, next: QuickReply) =>
    onChange(items.map((c, idx) => (idx === i ? next : c)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, { label: "", reply: "" }]);

  // Native drag-and-drop reordering within this level (siblings only).
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const move = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0) return;
    const next = [...items];
    const [m] = next.splice(from, 1);
    if (!m) return;
    next.splice(to, 0, m);
    onChange(next);
  };

  return (
    <div className="space-y-2.5">
      {depth === 0 && items.length === 0 && (
        <p className="rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground">
          No quick replies yet. Add one to guide visitors.
        </p>
      )}

      {items.map((chip, i) => {
        const hasChildren = !!chip.children && chip.children.length > 0;
        return (
          <div
            key={i}
            onDragOver={(e) => {
              if (dragIdx === null) return; // ignore drags from nested levels
              e.preventDefault();
              e.stopPropagation();
              if (overIdx !== i) setOverIdx(i);
            }}
            onDrop={(e) => {
              if (dragIdx === null) return;
              e.preventDefault();
              e.stopPropagation();
              move(dragIdx, i);
              setDragIdx(null);
              setOverIdx(null);
            }}
            className={cn(
              "rounded-lg border bg-muted/20 p-3 transition-colors",
              dragIdx === i && "opacity-50",
              overIdx === i && dragIdx !== i && "border-primary ring-1 ring-primary/40",
            )}
          >
            <div className="flex items-center gap-2">
              <span
                draggable
                onDragStart={(e) => {
                  setDragIdx(i);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragEnd={() => {
                  setDragIdx(null);
                  setOverIdx(null);
                }}
                title="Drag to reorder"
                className="flex-shrink-0 cursor-grab text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
              >
                <GripVertical size={14} />
              </span>
              <input
                className={cn(INPUT, "flex-1")}
                value={chip.label}
                onChange={(e) => update(i, { ...chip, label: e.target.value })}
                placeholder={depth === 0 ? "Chip label, e.g. Pricing" : "Sub-question label"}
                maxLength={80}
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label="Remove chip"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Leaf answer — only when there are no sub-questions */}
            {!hasChildren && (
              <>
                <textarea
                  className={cn(INPUT, "mt-2")}
                  rows={2}
                  value={chip.reply || ""}
                  onChange={(e) => update(i, { ...chip, reply: e.target.value })}
                  placeholder="Instant answer (optional). Leave blank to let the AI answer."
                  maxLength={2000}
                />
                <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                  {chip.reply && chip.reply.trim() ? (
                    <><Zap size={11} className="text-amber-500" /> Answers instantly with the text above.</>
                  ) : (
                    <><Bot size={11} /> Sends to the AI for an answer.</>
                  )}
                </p>
              </>
            )}

            {/* Nested children */}
            {hasChildren && (
              <div className="ml-2 mt-2.5 border-l-2 border-muted pl-3">
                <p className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  <CornerDownRight size={11} /> Sub-questions shown when this chip is tapped
                </p>
                <QuickReplyEditor
                  value={chip.children || []}
                  onChange={(ch) => update(i, { ...chip, children: ch })}
                  depth={depth + 1}
                />
              </div>
            )}

            {depth < MAX_DEPTH && (
              <button
                type="button"
                onClick={() =>
                  update(i, { ...chip, children: [...(chip.children || []), { label: "", reply: "" }] })
                }
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                <Plus size={11} /> Add sub-question
              </button>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Plus size={14} /> {depth === 0 ? "Add quick reply" : "Add option"}
      </button>
    </div>
  );
}

/** Recursively trim labels/replies and drop any chip with an empty label. */
export function cleanQuickReplies(items: QuickReply[]): QuickReply[] {
  return items
    .map((c) => {
      const children = cleanQuickReplies(c.children || []);
      const out: QuickReply = { label: c.label.trim() };
      const reply = c.reply?.trim();
      if (children.length) out.children = children;
      else if (reply) out.reply = reply;
      return out;
    })
    .filter((c) => c.label.length > 0);
}
