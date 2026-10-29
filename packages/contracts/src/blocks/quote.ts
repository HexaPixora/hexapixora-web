import { z } from "zod";
import { defineBlock } from "./define-block";
import { headFields, headShape, layoutField, surfaceField, surfaceShape } from "./shared";

export const quoteSchema = z.object({
  layout: z.enum(["pull", "letter"]).default("pull"),
  ...headShape,
  quote: z.string().default("Great design is the clearest expression of what a company believes."),
  /** letter: the letter itself; blank lines start paragraphs. */
  text: z.string().default(""),
  image: z.string().default(""),
  imageCaption: z.string().default(""),
  name: z.string().default(""),
  role: z.string().default(""),
  signature: z.string().default(""),
  stats: z.array(z.object({ value: z.string().default(""), label: z.string().default("") })).default([]),
  ...surfaceShape,
});

export type QuoteConfig = z.infer<typeof quoteSchema>;

export const QuoteDef = defineBlock(
  "quote",
  "Quote",
  "A pull quote, or a signed letter with a portrait.",
  quoteSchema,
  [
    layoutField([
      { label: "Pull quote", value: "pull" },
      { label: "Letter", value: "letter" },
    ]),
    ...headFields,
    { name: "quote", label: "Quote", type: "textarea" },
    {
      name: "text",
      label: "Letter",
      type: "textarea",
      showFor: ["letter"],
      description: "Leave a blank line between paragraphs.",
    },
    { name: "image", label: "Portrait", type: "image" },
    { name: "imageCaption", label: "Portrait caption", type: "text", showFor: ["letter"] },
    { name: "name", label: "Name", type: "text" },
    { name: "role", label: "Role", type: "text" },
    { name: "signature", label: "Signature", type: "text", showFor: ["letter"] },
    {
      name: "stats",
      label: "Numbers",
      type: "list",
      showFor: ["letter"],
      itemFields: [
        { name: "value", label: "Value", type: "text" },
        { name: "label", label: "Label", type: "text" },
      ],
    },
    surfaceField,
  ],
);
