import { z } from "zod";
import { defineBlock } from "./define-block";
import { headFields, headShape, layoutField, overlayField, overlaySchema, surfaceField, surfaceShape } from "./shared";

export const stepItemSchema = z.object({
  label: z.string().default(""),
  title: z.string().default(""),
  text: z.string().default(""),
  image: z.string().default(""),
});

export const stepsSchema = z.object({
  layout: z.enum(["row", "timeline", "story"]).default("row"),
  ...headShape,
  heading: z.string().default("How we work"),
  items: z.array(stepItemSchema).default([
    { label: "01", title: "Plan", text: "Goals, scope and a date.", image: "" },
    { label: "02", title: "Build", text: "Design and code in short rounds.", image: "" },
    { label: "03", title: "Launch", text: "Tested, fast and live.", image: "" },
  ]),
  /** timeline: optional background image. */
  image: z.string().default(""),
  overlay: overlaySchema,
  /** row: a closing line under the steps; *stars* highlight words. */
  note: z.string().default(""),
  ...surfaceShape,
});

export type StepsConfig = z.infer<typeof stepsSchema>;

export const StepsDef = defineBlock(
  "steps",
  "Steps",
  "A process, a timeline of milestones, or a scroll story with pictures.",
  stepsSchema,
  [
    layoutField([
      { label: "Row of steps", value: "row" },
      { label: "Timeline", value: "timeline" },
      { label: "Scroll story (with images)", value: "story" },
    ]),
    ...headFields,
    {
      name: "items",
      label: "Steps",
      type: "list",
      itemFields: [
        { name: "label", label: "Label", type: "text", description: "A number, a year or a date." },
        { name: "title", label: "Title", type: "text" },
        { name: "text", label: "Text", type: "textarea" },
        { name: "image", label: "Image", type: "image", showFor: ["story"] },
      ],
    },
    { name: "image", label: "Background image", type: "image", showFor: ["timeline"] },
    overlayField(["timeline"]),
    {
      name: "note",
      label: "Closing line",
      type: "text",
      showFor: ["row"],
      description: "Wrap words in *stars* to highlight them.",
    },
    surfaceField,
  ],
);
