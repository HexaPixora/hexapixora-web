import { z } from "zod";
import { defineBlock } from "./define-block";
import { headFields, headShape, layoutField, surfaceField, surfaceShape } from "./shared";
import { statItemSchema } from "./stats";

export const workItemSchema = z.object({
  label: z.string().default(""),
  title: z.string().default(""),
  text: z.string().default(""),
  image: z.string().default(""),
  url: z.string().default(""),
  /** grid: comma-separated categories. */
  tags: z.string().default(""),
  // dossier: an NDA case file; each detail can be redacted.
  number: z.string().default(""),
  client: z.string().default(""),
  clientRedacted: z.boolean().default(true),
  sector: z.string().default(""),
  sectorRedacted: z.boolean().default(false),
  region: z.string().default(""),
  regionRedacted: z.boolean().default(true),
  scope: z.string().default(""),
  scopeRedacted: z.boolean().default(false),
  outcome: z.string().default(""),
  outcomeRedacted: z.boolean().default(false),
});

export const workSchema = z.object({
  layout: z.enum(["grid", "dossier", "staggered", "scroll"]).default("grid"),
  ...headShape,
  heading: z.string().default("Selected work"),
  items: z.array(workItemSchema).default([]),
  /** dossier: paper case files or flat cards. */
  finish: z.enum(["paper", "flat"]).default("paper"),
  /** scroll: the card shape. */
  ratio: z.enum(["square", "portrait", "landscape", "wide"]).default("landscape"),
  stats: z.array(statItemSchema).default([]),
  note: z.string().default(""),
  ...surfaceShape,
});

export type WorkConfig = z.infer<typeof workSchema>;

const dossier = ["dossier"];

export const WorkDef = defineBlock(
  "work",
  "Work",
  "Projects as a grid, NDA case files, a staggered list or a side-scroll.",
  workSchema,
  [
    layoutField([
      { label: "Grid", value: "grid" },
      { label: "Case files (NDA)", value: "dossier" },
      { label: "Staggered", value: "staggered" },
      { label: "Side-scroll", value: "scroll" },
    ]),
    ...headFields,
    {
      name: "items",
      label: "Projects",
      type: "list",
      itemFields: [
        { name: "label", label: "Stamp", type: "text", showFor: dossier, placeholder: "NDA" },
        { name: "number", label: "File number", type: "text", showFor: dossier },
        { name: "title", label: "Title", type: "text" },
        { name: "text", label: "Text", type: "textarea", showFor: ["staggered", "scroll"] },
        { name: "image", label: "Image", type: "image", showFor: ["grid", "staggered", "scroll"] },
        { name: "url", label: "Link", type: "text", showFor: ["staggered", "scroll"] },
        { name: "tags", label: "Categories", type: "text", showFor: ["grid"], description: "Comma-separated." },
        { name: "client", label: "Client", type: "text", showFor: dossier },
        { name: "clientRedacted", label: "Hide client", type: "boolean", showFor: dossier },
        { name: "sector", label: "Sector", type: "text", showFor: dossier },
        { name: "sectorRedacted", label: "Hide sector", type: "boolean", showFor: dossier },
        { name: "region", label: "Region", type: "text", showFor: dossier },
        { name: "regionRedacted", label: "Hide region", type: "boolean", showFor: dossier },
        { name: "scope", label: "Scope", type: "text", showFor: dossier },
        { name: "scopeRedacted", label: "Hide scope", type: "boolean", showFor: dossier },
        { name: "outcome", label: "Outcome", type: "text", showFor: dossier },
        { name: "outcomeRedacted", label: "Hide outcome", type: "boolean", showFor: dossier },
      ],
    },
    {
      name: "finish",
      label: "Finish",
      type: "select",
      showFor: dossier,
      options: [
        { label: "Paper", value: "paper" },
        { label: "Flat", value: "flat" },
      ],
    },
    {
      name: "ratio",
      label: "Card shape",
      type: "select",
      showFor: ["scroll"],
      options: [
        { label: "Square", value: "square" },
        { label: "Portrait", value: "portrait" },
        { label: "Landscape", value: "landscape" },
        { label: "Wide", value: "wide" },
      ],
    },
    {
      name: "stats",
      label: "Numbers",
      type: "list",
      showFor: dossier,
      itemFields: [
        { name: "value", label: "Value", type: "text" },
        { name: "suffix", label: "Suffix", type: "text" },
        { name: "label", label: "Label", type: "text" },
      ],
    },
    { name: "note", label: "Note", type: "text" },
    surfaceField,
  ],
);
