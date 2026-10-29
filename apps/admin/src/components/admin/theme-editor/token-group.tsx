"use client";

import React from "react";
import { Input } from "@hexapixora/ui/input";

export type TokenField = { key: string; label: string; hint?: string };

/** #rgb or #rrggbb, which the native colour picker can show; other forms keep the text box only. */
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const expand = (hex: string) => (hex.length === 4 ? `#${[...hex.slice(1)].map((ch) => ch + ch).join("")}` : hex);

/**
 * A group of theme tokens as labelled text inputs, with a colour picker for
 * hex colours and the schema's message under any invalid value.
 */
export function TokenGroup({
  fields,
  values,
  errors,
  colour = false,
  onChange,
}: {
  fields: TokenField[];
  values: Record<string, string | undefined>;
  errors: Record<string, string>;
  colour?: boolean;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => {
        const value = values[field.key] ?? "";
        const error = errors[field.key];
        return (
          <div key={field.key} className="space-y-1.5">
            <label htmlFor={`token-${field.key}`} className="text-sm font-medium">
              {field.label}
            </label>
            <div className="flex gap-2">
              {colour ? (
                <input
                  type="color"
                  aria-label={`${field.label} picker`}
                  value={HEX.test(value) ? expand(value) : "#000000"}
                  disabled={!HEX.test(value) && value !== ""}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  className="h-10 w-12 shrink-0 cursor-pointer rounded-md border border-input bg-background p-1 disabled:opacity-40"
                />
              ) : null}
              <Input
                id={`token-${field.key}`}
                value={value}
                onChange={(e) => onChange(field.key, e.target.value)}
                aria-invalid={error ? true : undefined}
                className="font-mono text-sm"
              />
            </div>
            {error ? (
              <p className="text-xs text-destructive">{error}</p>
            ) : field.hint ? (
              <p className="text-xs text-muted-foreground">{field.hint}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
