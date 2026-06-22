import React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Uniform "nothing here yet" panel: optional icon, title, hint, optional action.
 * Use <EmptyRow> inside a table body, <EmptyState> anywhere else.
 */
export function EmptyState({
  icon: Icon,
  title,
  hint,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: React.ReactNode;
  hint?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 px-6 py-16 text-center", className)}>
      {Icon && (
        <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
          <Icon size={22} />
        </span>
      )}
      <p className="text-sm font-medium">{title}</p>
      {hint && <p className="max-w-sm text-xs text-muted-foreground">{hint}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

/** EmptyState rendered as a full-width table row. */
export function EmptyRow({
  colSpan,
  icon,
  title,
  hint,
  action,
}: {
  colSpan: number;
  icon?: LucideIcon;
  title: React.ReactNode;
  hint?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <EmptyState icon={icon} title={title} hint={hint} action={action} />
      </td>
    </tr>
  );
}
