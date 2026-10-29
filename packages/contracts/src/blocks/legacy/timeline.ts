import { z } from 'zod';
import { defineBlock } from './define-block';

export const timelineSchema = z.object({
  heading: z.string().default("Our Journey"),
  subheading: z.string().default(""),
  backgroundImage: z.string().default(""),
  overlay: z.enum(["none", "light", "medium", "dark"]).default("medium"),
  steps: z.array(z.object({
      date: z.string().default(""),
      title: z.string().default(""),
      text: z.string().default(""),
    })).default([
      { date: "2023", title: "Founded", text: "HexaPixora started with a simple idea: pixels meet logic." },
      { date: "2024", title: "Growing Team", text: "We expanded into a full-service digital agency." },
      { date: "Today", title: "Scaling Up", text: "Delivering high-performance products for clients worldwide." },
    ]),
});

export type TimelineProps = z.input<typeof timelineSchema>;

export const TimelineModuleDef = defineBlock(
  'TimelineModule',
  "Draw-line Timeline",
  "A vertical line that draws itself as you scroll, revealing steps (GSAP).",
  timelineSchema,
  [
    { name: "heading", label: "Heading", type: "text" },
    { name: "subheading", label: "Subheading", type: "textarea" },
    { name: "backgroundImage", label: "Background Image", type: "image", description: "Optional. Leave blank for a plain background." },
    {
      name: "overlay", label: "Overlay Darkness", type: "select",
      description: "Darkens the background image so text stays readable.",
      options: [
        { label: "None", value: "none" },
        { label: "Light", value: "light" },
        { label: "Medium", value: "medium" },
        { label: "Dark", value: "dark" },
      ],
    },
    {
      name: "steps",
      label: "Steps",
      type: "list",
      itemFields: [
        { name: "date", label: "Date / Label", type: "text" },
        { name: "title", label: "Title", type: "text" },
        { name: "text", label: "Text", type: "textarea" },
      ],
    },
  ]
);
