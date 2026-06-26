import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const scrollytellingSchema = z.object({
  heading: z.string().default("How We Work"),
  steps: z.array(z.object({
      image: z.string().default(""),
      title: z.string().default(""),
      text: z.string().default(""),
    })).default([
      { image: "", title: "Discover", text: "We start by understanding your goals, audience, and brand." },
      { image: "", title: "Design", text: "We craft clean, intentional interfaces that convert." },
      { image: "", title: "Build & Launch", text: "We ship fast, scalable products — and support you after." },
    ]),
});

export type ScrollytellingProps = z.input<typeof scrollytellingSchema>;

export const ScrollytellingModuleDef = createModuleDefinition(
  'ScrollytellingModule',
  "Pinned Scrollytelling",
  "A pinned image that swaps as the reader scrolls through steps (GSAP).",
  scrollytellingSchema,
  [
    { name: "heading", label: "Heading", type: "text" },
    {
      name: "steps",
      label: "Steps",
      type: "list",
      itemFields: [
        { name: "image", label: "Image", type: "image" },
        { name: "title", label: "Title", type: "text" },
        { name: "text", label: "Text", type: "textarea" },
      ],
    },
  ]
);
