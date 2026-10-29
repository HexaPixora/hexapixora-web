import { z } from "zod";
import { defineBlock } from "./define-block";
import { headFields, headShape, layoutField, surfaceField, surfaceShape } from "./shared";

export const planSchema = z.object({
  title: z.string().default(""),
  /** The price, e.g. "$999" or "Custom". */
  value: z.string().default(""),
  /** After the price, e.g. "/ project". */
  suffix: z.string().default(""),
  text: z.string().default(""),
  /** One feature per line. */
  features: z.string().default(""),
  linkText: z.string().default(""),
  url: z.string().default(""),
  highlighted: z.boolean().default(false),
});

export const pricingSchema = z.object({
  layout: z.enum(["plans"]).default("plans"),
  ...headShape,
  heading: z.string().default("Simple, clear pricing"),
  items: z.array(planSchema).default([]),
  ...surfaceShape,
});

export type PricingConfig = z.infer<typeof pricingSchema>;

export const PricingDef = defineBlock("pricing", "Pricing", "Price plans side by side.", pricingSchema, [
  layoutField([{ label: "Plans", value: "plans" }]),
  ...headFields,
  {
    name: "items",
    label: "Plans",
    type: "list",
    itemFields: [
      { name: "title", label: "Name", type: "text" },
      { name: "value", label: "Price", type: "text" },
      { name: "suffix", label: "Per", type: "text", placeholder: "/ project" },
      { name: "text", label: "Text", type: "textarea" },
      { name: "features", label: "Features", type: "textarea", description: "One per line." },
      { name: "linkText", label: "Button text", type: "text" },
      { name: "url", label: "Button link", type: "text" },
      { name: "highlighted", label: "Highlight", type: "boolean" },
    ],
  },
  surfaceField,
]);
