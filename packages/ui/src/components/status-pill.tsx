import React from "react";
import { cn } from "../lib/cn";
import type { StatusStyle } from "../lib/status-colors";

/** Renders a status as a colored pill using a {@link StatusStyle} from lib/status-colors. */
export function StatusPill({
  style,
  withDot = false,
  className,
  title,
  children,
}: {
  style: StatusStyle;
  withDot?: boolean;
  className?: string;
  title?: string;
  /** Extra content after the label (e.g. a scheduled date). */
  children?: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        style.cls,
        className,
      )}
      title={title}
    >
      {withDot && <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />}
      {style.label}
      {children}
    </span>
  );
}
