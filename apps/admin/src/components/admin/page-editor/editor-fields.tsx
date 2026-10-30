"use client";

import type { ReactNode } from "react";
import { FieldLabel, type Field } from "@puckeditor/core";
import { Input } from "@hexapixora/ui/input";
import { CategorySelect } from "@/components/admin/category-select";
import { MediaField } from "@/components/admin/media-field";
import {
  StatusControl,
  type ContentStatus,
} from "@/components/admin/status-control";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import type { CustomFieldFactory } from "@/lib/puck/puck-config";
import type { Publishing } from "@/lib/puck/puck-page";

// Puck draws no label for custom fields, so each one brings its own.
function Labelled({
  label,
  readOnly,
  children,
}: {
  label: string;
  readOnly?: boolean;
  children: ReactNode;
}) {
  return (
    <FieldLabel label={label} el="div" readOnly={readOnly}>
      {children}
    </FieldLabel>
  );
}

/** The media library control (upload or pick); read-only shows the address. */
export function mediaField(label: string, type: "image" | "video"): Field {
  return {
    type: "custom",
    label,
    render: ({ value, onChange, readOnly }) => (
      <Labelled label={label} readOnly={readOnly}>
        {readOnly ? (
          <Input value={typeof value === "string" ? value : ""} disabled />
        ) : (
          <MediaField
            type={type}
            value={typeof value === "string" ? value : ""}
            onChange={onChange}
          />
        )}
      </Labelled>
    ),
  };
}

/** Draft / scheduled / published, with the publish time when scheduled. */
export function publishingField(label: string): Field<Publishing> {
  return {
    type: "custom",
    label,
    render: ({ value, onChange, readOnly }) => (
      <Labelled label={label} readOnly={readOnly}>
        <StatusControl
          status={value?.status ?? "PUBLISHED"}
          publishAt={value?.publishAt ?? null}
          disabled={readOnly}
          onChange={(status: ContentStatus, publishAt) =>
            onChange({ status, publishAt })
          }
        />
      </Labelled>
    ),
  };
}

/**
 * Block fields Puck has no control for. Rich text is shown as its HTML when
 * read-only, never rendered: the API cleans it on save, but the editor's own
 * page doesn't need to trust it.
 */
export const editorField: CustomFieldFactory = (field) => {
  switch (field.type) {
    case "image":
    case "video":
      return mediaField(field.label, field.type);
    case "richtext":
      return {
        type: "custom",
        label: field.label,
        render: ({ value, onChange, readOnly }) => (
          <Labelled label={field.label} readOnly={readOnly}>
            {readOnly ? (
              <pre className="max-h-60 overflow-auto whitespace-pre-wrap rounded-md border p-2 text-xs">
                {typeof value === "string" ? value : ""}
              </pre>
            ) : (
              <div className="rounded-md border">
                <TiptapEditor
                  value={typeof value === "string" ? value : ""}
                  onChange={onChange}
                />
              </div>
            )}
          </Labelled>
        ),
      };
    case "categories":
      return {
        type: "custom",
        label: field.label,
        render: ({ value, onChange, readOnly }) => {
          const names = Array.isArray(value) ? (value as string[]) : [];
          return (
            <Labelled label={field.label} readOnly={readOnly}>
              {readOnly ? (
                <p className="text-sm">{names.join(", ") || "None"}</p>
              ) : (
                // The block shows category names, so names are stored.
                <CategorySelect by="name" value={names} onChange={onChange} />
              )}
            </Labelled>
          );
        },
      };
    default:
      return { type: "text", label: field.label };
  }
};
