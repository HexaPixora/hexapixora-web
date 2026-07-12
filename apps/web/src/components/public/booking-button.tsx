"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { openCalendlyPopup } from "@/lib/calendly";
import { trackEvent } from "@/lib/analytics";
import { CalendarClock } from "lucide-react";

export interface BookingLink {
  label: string;
  url: string;
}

/**
 * Renders a "Book a call" control from a list of meeting types. One link → a
 * single button (uses `buttonText`); multiple → one button per meeting type.
 * Clicking opens the Calendly scheduling popup.
 */
export default function BookingButton({
  links,
  buttonText = "Book a call",
  className,
  variant = "solid",
}: {
  links: BookingLink[];
  buttonText?: string;
  className?: string;
  variant?: "solid" | "outline";
}) {
  const valid = (links || []).filter((l) => l?.url && l?.label);
  if (valid.length === 0) return null;

  // Fires a lead-intent event, then opens the Calendly popup.
  const book = (url: string, label: string) => {
    trackEvent("book_call", { meeting_type: label });
    openCalendlyPopup(url);
  };

  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all hover:scale-[1.02]";
  const styles =
    variant === "outline"
      ? "border border-primary/40 text-primary hover:bg-primary/10"
      : "bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25";

  // Single meeting type → one button with the configured text.
  if (valid.length === 1) {
    return (
      <button onClick={() => book(valid[0]!.url, valid[0]!.label)} className={cn(base, styles, className)}>
        <CalendarClock size={16} /> {buttonText}
      </button>
    );
  }

  // Multiple meeting types → a labelled button per type.
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-3", className)}>
      {valid.map((l, i) => (
        <button key={i} onClick={() => book(l.url, l.label)} className={cn(base, styles)}>
          <CalendarClock size={16} /> {l.label}
        </button>
      ))}
    </div>
  );
}
