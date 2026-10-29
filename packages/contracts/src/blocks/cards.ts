import { z } from "zod";
import { defineBlock } from "./define-block";
import { actionsField, actionsShape, headFields, headShape, layoutField, surfaceField, surfaceShape } from "./shared";

export const cardItemSchema = z.object({
  label: z.string().default(""),
  title: z.string().default(""),
  text: z.string().default(""),
  icon: z.string().default(""),
  url: z.string().default(""),
  linkText: z.string().default(""),
  /** meters: a level from 0 to 100. */
  value: z.string().default(""),
  /** pillars: a comma-separated list shown under the text. */
  tags: z.string().default(""),
});

const card = (title: string, text: string, icon: string) => ({ ...cardItemSchema.parse({}), title, text, icon });

export const cardsSchema = z.object({
  layout: z.enum(["grid", "icons", "pillars", "logos", "meters"]).default("grid"),
  ...headShape,
  heading: z.string().default("What we do"),
  items: z
    .array(cardItemSchema)
    .default([
      card("Websites", "Fast, search-friendly sites.", "globe"),
      card("Apps", "Mobile and web apps.", "smartphone"),
      card("Brands", "Identity and design systems.", "palette"),
    ]),
  ...actionsShape,
  ...surfaceShape,
});

export type CardsConfig = z.infer<typeof cardsSchema>;

export const CardsDef = defineBlock(
  "cards",
  "Cards",
  "A set of items: services, reasons, pillars, technologies or skill levels.",
  cardsSchema,
  [
    layoutField([
      { label: "Grid of cards", value: "grid" },
      { label: "Icons and text", value: "icons" },
      { label: "Pillars (large rows)", value: "pillars" },
      { label: "Logos and names", value: "logos" },
      { label: "Skill meters", value: "meters" },
    ]),
    ...headFields,
    {
      name: "items",
      label: "Items",
      type: "list",
      itemFields: [
        {
          name: "label",
          label: "Label",
          type: "text",
          showFor: ["pillars", "logos"],
          description: "Pillars: small label. Logos: category.",
        },
        { name: "title", label: "Title", type: "text" },
        { name: "text", label: "Text", type: "textarea", showFor: ["grid", "icons", "pillars"] },
        {
          name: "icon",
          label: "Icon",
          type: "text",
          showFor: ["grid", "icons", "logos"],
          description: "A lucide icon name, or an image URL for logos.",
        },
        { name: "url", label: "Link", type: "text", showFor: ["grid"] },
        { name: "linkText", label: "Link text", type: "text", showFor: ["grid"] },
        { name: "value", label: "Level (0–100)", type: "text", showFor: ["meters"] },
        { name: "tags", label: "Tags", type: "text", showFor: ["pillars"], description: "Comma-separated." },
      ],
    },
    actionsField(),
    surfaceField,
  ],
);
