import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const workHeroSchema = z.object({
  eyebrow: z.string().default("Our Work"),
  heading: z.string().default("Work that moves the needle"),
  subheading: z.string().default("A selection of the products, brands and experiences we've crafted for clients around the world."),
  buttonText: z.string().default("Start a project"),
  buttonUrl: z.string().default("#contact"),
  stats: z.array(z.object({
      value: z.string().default(""),
      label: z.string().default(""),
    })).default([
      { value: "120+", label: "Projects shipped" },
      { value: "40+", label: "Happy clients" },
      { value: "15", label: "Awards" },
      { value: "98%", label: "Satisfaction" },
    ]),
});

export type WorkHeroProps = z.input<typeof workHeroSchema>;

export const WorkHeroModuleDef = createModuleDefinition(
  'WorkHeroModule',
  "Work Page Hero",
  "Bold hero for a portfolio/work page — heading, CTA and headline stats.",
  workHeroSchema,
  [
    { name: "eyebrow", label: "Eyebrow / Label", type: "text", description: "Leave empty to hide." },
    { name: "heading", label: "Heading", type: "text" },
    { name: "subheading", label: "Subheading", type: "textarea" },
    { name: "buttonText", label: "Button Text", type: "text", description: "Leave empty to hide." },
    { name: "buttonUrl", label: "Button URL", type: "text" },
    {
      name: "stats",
      label: "Stats (optional)",
      type: "list",
      itemFields: [
        { name: "value", label: "Value", type: "text", placeholder: "120+" },
        { name: "label", label: "Label", type: "text", placeholder: "Projects shipped" },
      ],
    },
  ]
);
