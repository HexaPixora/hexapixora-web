import React from "react";
import { cn } from "@/lib/utils";

/**
 * Card shell with an optional bordered header (title + description + action).
 * The canonical replacement for ad-hoc `bg-card border rounded-xl p-5/6` panels.
 */
export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  const hasHeader = title || description || action;
  return (
    <section className={cn("overflow-hidden rounded-xl border bg-card shadow-sm", className)}>
      {hasHeader && (
        <div className="flex items-start justify-between gap-4 border-b px-6 py-4">
          <div className="space-y-0.5">
            {title && <h3 className="font-semibold">{title}</h3>}
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn("p-6", bodyClassName)}>{children}</div>
    </section>
  );
}
