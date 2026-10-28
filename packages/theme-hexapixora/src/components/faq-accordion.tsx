"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export type FaqItem = { question: string; answer: string };

/**
 * Public FAQ accordion with a smooth open/close transition.
 *
 * Native <details> can't animate its height across browsers, so we animate the
 * answer wrapper via `grid-template-rows: 0fr -> 1fr`, which the GPU handles
 * smoothly everywhere (incl. iOS Safari) without measuring content height.
 * Each item toggles independently.
 */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<Set<number>>(new Set());

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div className="mt-6 flex flex-col gap-3">
      {items.map((item, i) => {
        const isOpen = open.has(i);
        return (
          <div
            key={i}
            className={`overflow-hidden rounded-2xl border transition-colors duration-200 ${
              isOpen ? "border-white/[0.18] bg-white/[0.03]" : "border-white/10 bg-white/[0.02]"
            }`}
          >
            <h3 className="m-0">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                id={`faq-trigger-${i}`}
                onClick={() => toggle(i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-white transition-colors hover:text-[#7cc4ff]"
              >
                <span>{item.question}</span>
                <ChevronDown
                  size={18}
                  aria-hidden
                  className={`flex-none text-[#7cc4ff] transition-transform duration-300 ease-out ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </h3>

            <div
              id={`faq-panel-${i}`}
              role="region"
              aria-labelledby={`faq-trigger-${i}`}
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="whitespace-pre-line px-5 pb-[1.1rem] leading-[1.65] text-white/[0.68]">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
