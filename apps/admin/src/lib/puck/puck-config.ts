import type { ReactElement } from "react";
import type { ComponentConfig, Config, Field, Fields } from "@puckeditor/core";
import {
  BLOCKS,
  BLOCK_GROUPS,
  type BlockId,
} from "@hexapixora/contracts/blocks/library";
import type {
  ModuleDefinition,
  ModuleField,
} from "@hexapixora/contracts/blocks/registry";
import { HIDDEN_PROP, LABEL_PROP } from "./puck-sections";

/** Field types Puck has no control for; the editor supplies its own (media library, rich text, categories). */
export type CustomFieldType = "image" | "video" | "richtext" | "categories";
export type CustomFieldFactory = (field: ModuleField) => Field;

type ItemField = NonNullable<ModuleField["itemFields"]>[number];

/** Fields without `showFor` always show; the others only for the listed layouts. */
export function shows(
  field: Pick<ModuleField, "showFor">,
  layout: unknown,
): boolean {
  return (
    !field.showFor ||
    (typeof layout === "string" && field.showFor.includes(layout))
  );
}

/** The value a new list item starts with, so selects and switches are never blank. */
function itemDefault(field: ItemField): unknown {
  if (field.defaultValue !== undefined) return field.defaultValue;
  if (field.type === "boolean") return false;
  if (field.type === "select") return field.options?.[0]?.value ?? "";
  return "";
}

const SUMMARY_KEYS = ["title", "label", "heading", "value", "text", "question"];

/** One line naming a list item in the collapsed list: its first filled text. */
function itemSummary(singular: string) {
  return (item: Record<string, unknown>, index = 0): string => {
    for (const key of SUMMARY_KEYS) {
      const value = item[key];
      if (typeof value === "string" && value.trim())
        return value.trim().slice(0, 60);
    }
    return `${singular} ${index + 1}`;
  };
}

/** One of our field definitions as a Puck field, showing only what `layout` uses. */
export function toPuckField(
  field: ModuleField,
  layout: unknown,
  custom: CustomFieldFactory,
): Field {
  const label = field.label;
  switch (field.type) {
    case "text":
      return { type: "text", label, placeholder: field.placeholder };
    case "textarea":
      return { type: "textarea", label, placeholder: field.placeholder };
    case "select":
      return { type: "select", label, options: field.options ?? [] };
    case "boolean":
      return {
        type: "radio",
        label,
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      };
    case "list": {
      const items = (field.itemFields ?? []).filter((item) =>
        shows(item, layout),
      );
      const singular = label.replace(/s$/, "");
      return {
        type: "array",
        label,
        arrayFields: Object.fromEntries(
          items.map((item) => [item.name, toPuckField(item, layout, custom)]),
        ),
        defaultItemProps: Object.fromEntries(
          items.map((item) => [item.name, itemDefault(item)]),
        ),
        getItemSummary: itemSummary(singular),
      };
    }
    case "image":
    case "video":
    case "richtext":
    case "categories":
      return custom(field);
  }
}

/** A block's Puck fields for one layout: the block's own fields, then its name and visibility. */
export function blockFields(
  def: ModuleDefinition,
  layout: unknown,
  custom: CustomFieldFactory,
): Fields {
  const fields: Fields = {};
  for (const field of def.fields) {
    if (shows(field, layout))
      fields[field.name] = toPuckField(field, layout, custom);
  }
  fields[LABEL_PROP] = { type: "text", label: "Name in the outline" };
  fields[HIDDEN_PROP] = {
    type: "radio",
    label: "On the page",
    options: [
      { label: "Shown", value: false },
      { label: "Hidden", value: true },
    ],
  };
  return fields;
}

export type BlockRender = (
  type: BlockId,
  props: Record<string, unknown>,
) => ReactElement;

/**
 * The Puck config for the block library. `render` draws a block with the
 * theme's own component; `defaults` are the saved module defaults (Modules
 * page), which new blocks start from.
 */
export function buildPuckConfig({
  render,
  custom,
  defaults = {},
}: {
  render: BlockRender;
  custom: CustomFieldFactory;
  defaults?: Record<string, Record<string, unknown>>;
}): Config {
  const components: Record<string, ComponentConfig> = {};
  for (const [id, def] of Object.entries(BLOCKS) as [
    BlockId,
    ModuleDefinition,
  ][]) {
    const defaultProps: Record<string, unknown> = {
      ...def.defaultConfig,
      ...defaults[id],
      [LABEL_PROP]: def.label,
      [HIDDEN_PROP]: false,
    };
    components[id] = {
      label: def.label,
      defaultProps,
      fields: blockFields(def, defaultProps.layout, custom),
      resolveFields: (data) =>
        blockFields(def, data.props.layout ?? def.defaultConfig.layout, custom),
      render: (props) => render(id, props),
    };
  }
  const categories = Object.fromEntries(
    BLOCK_GROUPS.map((group) => [
      group.label.toLowerCase().replace(/[^a-z]+/g, "-"),
      { title: group.label, components: group.blocks },
    ]),
  );
  return { components, categories };
}
