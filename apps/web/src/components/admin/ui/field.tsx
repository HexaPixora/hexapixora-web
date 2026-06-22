import React from "react";
import { cn } from "@/lib/utils";

/**
 * Label + control + hint/error wrapper with one canonical spacing/typography.
 * Replaces the repeated `<div className="space-y-1.5"><label className="text-sm
 * font-medium">…` blocks across forms.
 */
export function Field({
  label,
  hint,
  error,
  htmlFor,
  required,
  children,
  className,
}: {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="flex items-center gap-1 text-sm font-medium">
          {label}
          {required && <span className="text-destructive">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
