import { z } from "zod";
import { defineBlock } from "./define-block";
import { actionsField, actionsShape, headFields, headShape, layoutField, surfaceField, surfaceShape } from "./shared";

export const textSchema = z.object({
  layout: z.enum(["statement", "prose", "split"]).default("statement"),
  ...headShape,
  /** statement, split: plain text; *stars* mark words to highlight. */
  text: z.string().default("Say what the studio stands for in one or two sentences."),
  /** prose: formatted HTML, cleaned by the API on save. */
  content: z.string().default(""),
  image: z.string().default(""),
  items: z.array(z.object({ title: z.string().default(""), text: z.string().default("") })).default([]),
  /** prose: e.g. "Last updated 1 May 2026". */
  note: z.string().default(""),
  ...actionsShape,
  ...surfaceShape,
});

export type TextConfig = z.infer<typeof textSchema>;

export const TextDef = defineBlock(
  "text",
  "Text",
  "A statement, long formatted text, or text beside an image.",
  textSchema,
  [
    layoutField([
      { label: "Statement (large)", value: "statement" },
      { label: "Formatted text (articles, legal)", value: "prose" },
      { label: "Text and image", value: "split" },
    ]),
    ...headFields,
    {
      name: "text",
      label: "Text",
      type: "textarea",
      showFor: ["statement", "split"],
      description: "Wrap words in *stars* to highlight them.",
    },
    { name: "content", label: "Content", type: "richtext", showFor: ["prose"] },
    { name: "note", label: "Note", type: "text", showFor: ["prose"], placeholder: "Last updated 1 May 2026" },
    { name: "image", label: "Image", type: "image", showFor: ["split"] },
    {
      name: "items",
      label: "Highlights",
      type: "list",
      showFor: ["split"],
      itemFields: [
        { name: "title", label: "Title", type: "text" },
        { name: "text", label: "Text", type: "textarea" },
      ],
    },
    actionsField(["split"]),
    surfaceField,
  ],
);
