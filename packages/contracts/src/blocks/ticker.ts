import { z } from "zod";
import { defineBlock } from "./define-block";
import { headFields, headShape, layoutField, surfaceField, surfaceShape } from "./shared";

export const tickerSchema = z.object({
  layout: z.enum(["words", "logos"]).default("words"),
  ...headShape,
  items: z.array(z.object({ title: z.string().default(""), image: z.string().default("") })).default([
    { title: "Websites", image: "" },
    { title: "Apps", image: "" },
    { title: "Platforms", image: "" },
    { title: "Brands", image: "" },
  ]),
  speed: z.enum(["slow", "normal", "fast"]).default("normal"),
  direction: z.enum(["left", "right"]).default("left"),
  ...surfaceShape,
});

export type TickerConfig = z.infer<typeof tickerSchema>;

export const TickerDef = defineBlock("ticker", "Ticker", "A moving band of words or client logos.", tickerSchema, [
  layoutField([
    { label: "Words", value: "words" },
    { label: "Logos", value: "logos" },
  ]),
  ...headFields,
  {
    name: "items",
    label: "Items",
    type: "list",
    itemFields: [
      { name: "title", label: "Text or name", type: "text" },
      { name: "image", label: "Logo or picture", type: "image" },
    ],
  },
  {
    name: "speed",
    label: "Speed",
    type: "select",
    options: [
      { label: "Slow", value: "slow" },
      { label: "Normal", value: "normal" },
      { label: "Fast", value: "fast" },
    ],
  },
  {
    name: "direction",
    label: "Direction",
    type: "select",
    options: [
      { label: "Left", value: "left" },
      { label: "Right", value: "right" },
    ],
  },
  surfaceField,
]);
