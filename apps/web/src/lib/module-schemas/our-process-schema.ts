import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const ourProcessSchema = z.object({
  eyebrow: z.string().default("How We Work"),
  heading: z.string().default("Our Process"),
  subheading: z.string().default("A proven, collaborative process that turns ideas into polished, high-performing products."),
  steps: z.array(z.object({
      title: z.string().default(""),
      description: z.string().default(""),
    })).default([
      { title: "Discover", description: "We dig into your goals, users and market to define what success actually looks like." },
      { title: "Design", description: "We craft intuitive, on-brand experiences — from wireframes to a polished, tested UI." },
      { title: "Build", description: "We engineer fast, scalable and maintainable products with modern technology." },
      { title: "Launch & Grow", description: "We ship, measure and iterate — improving continuously with real-world data." },
    ]),
});

export type OurProcessProps = z.input<typeof ourProcessSchema>;

export const OurProcessModuleDef = createModuleDefinition(
  'OurProcessModule',
  "Our Process",
  "Numbered, glass step cards showing how you work — Discover, Design, Build, Launch.",
  ourProcessSchema,
  [
    { name: "eyebrow", label: "Eyebrow / Label", type: "text", description: "Leave empty to hide." },
    { name: "heading", label: "Heading", type: "text" },
    { name: "subheading", label: "Subheading", type: "textarea" },
    {
      name: "steps",
      label: "Steps (numbered automatically)",
      type: "list",
      itemFields: [
        { name: "title", label: "Title", type: "text" },
        { name: "description", label: "Description", type: "textarea" },
      ],
    },
  ]
);
