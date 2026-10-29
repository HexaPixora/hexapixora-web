import { z } from "zod";
import { defineBlock } from "./define-block";
import { headFields, headShape, layoutField, surfaceField, surfaceShape } from "./shared";

export const statItemSchema = z.object({
  value: z.string().default(""),
  suffix: z.string().default(""),
  label: z.string().default(""),
});

export const statsSchema = z.object({
  layout: z.enum(["counters", "row"]).default("counters"),
  ...headShape,
  items: z.array(statItemSchema).default([
    { value: "120", suffix: "+", label: "Projects shipped" },
    { value: "98", suffix: "%", label: "On the agreed date" },
    { value: "1", suffix: "s", label: "Page load" },
  ]),
  ...surfaceShape,
});

export type StatsConfig = z.infer<typeof statsSchema>;

export const StatsDef = defineBlock("stats", "Numbers", "Key numbers in a row, optionally counting up.", statsSchema, [
  layoutField([
    { label: "Counting up", value: "counters" },
    { label: "Plain row", value: "row" },
  ]),
  ...headFields,
  {
    name: "items",
    label: "Numbers",
    type: "list",
    itemFields: [
      { name: "value", label: "Value", type: "text" },
      { name: "suffix", label: "Suffix", type: "text", placeholder: "+ or %" },
      { name: "label", label: "Label", type: "text" },
    ],
  },
  surfaceField,
]);
