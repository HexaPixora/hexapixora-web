import { z } from "zod";
import { defineBlock } from "./define-block";
import { headFields, headShape, layoutField, surfaceField, surfaceShape } from "./shared";

export const productSchema = z.object({
  label: z.string().default(""),
  title: z.string().default(""),
  text: z.string().default(""),
  visual: z.enum(["film", "nodes"]).default("film"),
  linkText: z.string().default(""),
  url: z.string().default(""),
  /** An optional progress bar, e.g. for a product still in development. */
  progressLabel: z.string().default(""),
  progress: z.coerce.number().min(0).max(100).default(0),
});

export const productsSchema = z.object({
  layout: z.enum(["cards"]).default("cards"),
  ...headShape,
  heading: z.string().default("From the Lab"),
  items: z.array(productSchema).default([]),
  ...surfaceShape,
});

export type ProductsConfig = z.infer<typeof productsSchema>;

export const ProductsDef = defineBlock(
  "products",
  "Products",
  "Products the studio owns, as large cards with a moving visual.",
  productsSchema,
  [
    layoutField([{ label: "Large cards", value: "cards" }]),
    ...headFields,
    {
      name: "items",
      label: "Products",
      type: "list",
      itemFields: [
        { name: "label", label: "Label", type: "text", placeholder: "Game · Live on Google Play" },
        { name: "title", label: "Name", type: "text" },
        { name: "text", label: "Text", type: "textarea" },
        {
          name: "visual",
          label: "Visual",
          type: "select",
          options: [
            { label: "Moving film", value: "film" },
            { label: "Node network", value: "nodes" },
          ],
        },
        { name: "linkText", label: "Button text", type: "text" },
        { name: "url", label: "Button link", type: "text", description: "Leave empty to hide the button." },
        { name: "progressLabel", label: "Progress label", type: "text", description: "Leave empty to hide the bar." },
        { name: "progress", label: "Progress (0–100)", type: "text" },
      ],
    },
    surfaceField,
  ],
);
