"use client";

import { FileEdit, CalendarClock, Globe } from "lucide-react";

export type ContentStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED";

const OPTIONS: { value: ContentStatus; label: string; icon: typeof Globe }[] = [
  { value: "DRAFT", label: "Draft", icon: FileEdit },
  { value: "SCHEDULED", label: "Scheduled", icon: CalendarClock },
  { value: "PUBLISHED", label: "Published", icon: Globe },
];

/** Convert an ISO/Date string to the value a datetime-local input expects (local time). */
function toLocalInput(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
}

/**
 * Segmented Draft / Scheduled / Published control with a publish-time picker
 * that appears when Scheduled is selected. Used by the page and blog editors.
 */
export function StatusControl({
  status,
  publishAt,
  onChange,
  disabled,
}: {
  status: ContentStatus;
  publishAt?: string | null;
  onChange: (status: ContentStatus, publishAt: string | null) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-1 rounded-lg border bg-muted/40 p-1">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const active = status === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              onClick={() =>
                onChange(opt.value, opt.value === "SCHEDULED" ? publishAt ?? null : null)
              }
              className={`flex flex-col items-center gap-1 rounded-md px-2 py-2 text-xs font-medium transition-colors disabled:opacity-50 ${
                active
                  ? "bg-background text-primary shadow-sm ring-1 ring-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={16} />
              {opt.label}
            </button>
          );
        })}
      </div>

      {status === "SCHEDULED" && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Publish at
          </label>
          <input
            type="datetime-local"
            disabled={disabled}
            value={toLocalInput(publishAt)}
            onChange={(e) =>
              onChange(
                "SCHEDULED",
                e.target.value ? new Date(e.target.value).toISOString() : null,
              )
            }
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p className="text-[11px] text-muted-foreground">
            Goes live automatically at this time. Leave the future date and save.
          </p>
        </div>
      )}
    </div>
  );
}
