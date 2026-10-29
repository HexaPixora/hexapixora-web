import { z } from 'zod';
import { defineBlock } from '../define-block';
import { chapterFields, chapterShape } from '../section-fields';

export const labSchema = z.object({
  ...chapterShape,
  chapter: z.string().default("05"),
  heading: z.string().default("From the Lab"),
  aside: z.string().default("Products we own"),
  items: z.array(z.object({
    kind: z.string().default(""),
    title: z.string().default(""),
    text: z.string().default(""),
    visual: z.enum(["film", "nodes"]).default("film"),
    linkText: z.string().default(""),
    linkUrl: z.string().default(""),
    // Optional progress bar, e.g. for a product still in development.
    progressLabel: z.string().default(""),
    progress: z.coerce.number().min(0).max(100).default(0),
  })).default([
    { kind: "Game · Live on Google Play", title: "Antumbra", text: "Our own game, designed, built and shipped by the studio.", visual: "film", linkText: "Get it on Google Play", linkUrl: "", progressLabel: "", progress: 0 },
    { kind: "AI · In development", title: "AgentCraft", text: "An app that teaches AI automation, step by step.", visual: "nodes", linkText: "", linkUrl: "", progressLabel: "In the Lab · building", progress: 60 },
  ]),
});

export type LabProps = z.input<typeof labSchema>;

export const LabDef = defineBlock(
  'lab',
  "Lab Products",
  "Own products as large cards with a moving film or node-network visual.",
  labSchema,
  [
    ...chapterFields,
    {
      name: "items", label: "Products", type: "list", itemFields: [
        { name: "kind", label: "Label", type: "text", placeholder: "Game · Live on Google Play" },
        { name: "title", label: "Name", type: "text" },
        { name: "text", label: "Text", type: "textarea" },
        { name: "visual", label: "Visual", type: "select", options: [{ label: "Moving film", value: "film" }, { label: "Node network", value: "nodes" }] },
        { name: "linkText", label: "Button text", type: "text" },
        { name: "linkUrl", label: "Button link", type: "text", description: "Leave empty to hide the button." },
        { name: "progressLabel", label: "Progress label", type: "text", description: "Leave empty to hide the progress bar." },
        { name: "progress", label: "Progress (0–100)", type: "text" },
      ],
    },
  ]
);
