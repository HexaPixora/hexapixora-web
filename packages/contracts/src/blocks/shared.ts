import { z } from "zod";
import type { ModuleField } from "./types";

// The vocabulary every block shares, so the same words mean the same thing in
// every block and the editor looks the same everywhere (plans/phase-3c).

/** The heading group above a block's content. Every part is optional. */
export const headShape = {
  anchorId: z.string().default(""),
  number: z.string().default(""),
  label: z.string().default(""),
  heading: z.string().default(""),
  intro: z.string().default(""),
  aside: z.string().default(""),
  headStyle: z.enum(["display", "chapter"]).default("display"),
};

export const headFields: ModuleField[] = [
  { name: "label", label: "Label", type: "text", description: "A short line above the heading." },
  { name: "heading", label: "Heading", type: "textarea", description: "Each line break starts a new line." },
  { name: "intro", label: "Intro", type: "textarea" },
  {
    name: "headStyle",
    label: "Heading style",
    type: "select",
    options: [
      { label: "Display (large heading)", value: "display" },
      { label: "Chapter row (number / heading … note)", value: "chapter" },
    ],
  },
  { name: "number", label: "Chapter number", type: "text", placeholder: "01" },
  { name: "aside", label: "Chapter note (right)", type: "text" },
  {
    name: "anchorId",
    label: "Anchor ID",
    type: "text",
    description: "For links like #contact. Letters, numbers and dashes.",
  },
];

export const actionSchema = z.object({
  label: z.string().default(""),
  url: z.string().default(""),
  style: z.enum(["primary", "secondary"]).default("primary"),
});

export type Action = z.infer<typeof actionSchema>;

export const actionsShape = { actions: z.array(actionSchema).default([]) };

export const actionsField = (showFor?: string[]): ModuleField => ({
  name: "actions",
  label: "Buttons",
  type: "list",
  showFor,
  itemFields: [
    { name: "label", label: "Text", type: "text" },
    { name: "url", label: "Link", type: "text", placeholder: "/contact-us or https://…" },
    {
      name: "style",
      label: "Style",
      type: "select",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
      ],
    },
  ],
});

/** Background of the section, from the theme's tokens only (never free colours). */
export const surfaceShape = { surface: z.enum(["default", "raised", "brand"]).default("default") };

export const surfaceField: ModuleField = {
  name: "surface",
  label: "Background",
  type: "select",
  options: [
    { label: "Page", value: "default" },
    { label: "Raised", value: "raised" },
    { label: "Brand", value: "brand" },
  ],
};

/** The Layout select; the first option is the default. */
export const layoutField = (options: { label: string; value: string }[]): ModuleField => ({
  name: "layout",
  label: "Layout",
  type: "select",
  options,
});

/** Image overlay strength for layouts with a background image. */
export const overlaySchema = z.enum(["none", "light", "medium", "dark"]).default("medium");

export const overlayField = (showFor?: string[]): ModuleField => ({
  name: "overlay",
  label: "Image darkening",
  type: "select",
  showFor,
  options: [
    { label: "None", value: "none" },
    { label: "Light", value: "light" },
    { label: "Medium", value: "medium" },
    { label: "Dark", value: "dark" },
  ],
});
