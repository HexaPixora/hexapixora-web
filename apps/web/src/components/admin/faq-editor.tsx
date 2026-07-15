"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export type FaqItem = { question: string; answer: string };

/**
 * Structured FAQ editor — a repeatable list of question/answer rows. Stored on
 * the post as a real field (not prose), so it renders reliably as an accordion
 * and powers FAQ rich results, regardless of how the post was written.
 */
export function FaqEditor({
  value,
  onChange,
}: {
  value?: FaqItem[];
  onChange: (v: FaqItem[]) => void;
}) {
  const items = Array.isArray(value) ? value : [];
  const add = () => onChange([...items, { question: "", answer: "" }]);
  const update = (i: number, field: keyof FaqItem, val: string) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, [field]: val } : it)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No FAQs yet. Add the questions readers commonly ask — they render as an accordion on the
          post and power FAQ rich results in search.
        </p>
      )}

      {items.map((it, i) => (
        <div key={i} className="space-y-2 rounded-lg border bg-muted/10 p-3">
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-xs font-semibold text-muted-foreground">Q{i + 1}</span>
            <Input
              placeholder="Question"
              value={it.question}
              onChange={(e) => update(i, "question", e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-destructive hover:bg-destructive/10"
              title="Remove"
              onClick={() => remove(i)}
            >
              <Trash2 size={14} />
            </Button>
          </div>
          <Textarea
            placeholder="Answer"
            rows={3}
            value={it.answer}
            onChange={(e) => update(i, "answer", e.target.value)}
          />
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus size={14} className="mr-1.5" /> Add question
      </Button>
    </div>
  );
}
