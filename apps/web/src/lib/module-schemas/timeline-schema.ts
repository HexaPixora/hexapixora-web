import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const timelineSchema = z.object({
  heading: z.string().default("Our Journey"),
  subheading: z.string().default(""),
  lineColor: z.string().default(""),
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

export const TimelineModuleDef = createModuleDefinition(
  'TimelineModule',
  "Draw-line Timeline",
  "A vertical line that draws itself as you scroll, revealing steps (GSAP).",
  timelineSchema,
  [
    { name: "heading", label: "Heading", type: "text" },
    { name: "subheading", label: "Subheading", type: "textarea" },
    { name: "lineColor", label: "Line Color", type: "color", description: "Leave blank to use the theme color." },
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
