import React from "react";
import { cn } from "@/lib/utils";
import type { StatusStyle } from "@/lib/admin/status-colors";

/** Renders a status as a colored pill using a {@link StatusStyle} from lib/admin/status-colors. */
export function StatusPill({
  style,
  withDot = false,
  className,
}: {
  style: StatusStyle;
  withDot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        style.cls,
        className,
      )}
    >
      {withDot && <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />}
      {style.label}
    </span>
  );
}
