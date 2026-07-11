import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const storyHeroSchema = z.object({
  eyebrow: z.string().default("Our Story"),
  heading: z.string().default("Great products start with great stories"),
  intro: z.string().default("We're a team of designers, engineers and strategists on a mission to build digital experiences that feel effortless — and unmistakably yours."),
  foundedLabel: z.string().default("Est. 2019"),
  image: z.string().default(""),
});

export type StoryHeroProps = z.input<typeof storyHeroSchema>;

export const StoryHeroModuleDef = createModuleDefinition(
  'StoryHeroModule',
  "Story Page Hero",
  "Editorial hero for an about/story page — intro narrative, founded badge and optional image.",
  storyHeroSchema,
  [
    { name: "eyebrow", label: "Eyebrow / Label", type: "text", description: "Leave empty to hide." },
    { name: "heading", label: "Heading", type: "text" },
    { name: "intro", label: "Intro paragraph", type: "textarea" },
    { name: "foundedLabel", label: "Founded badge", type: "text", description: "e.g. \"Est. 2019\". Leave empty to hide." },
    { name: "image", label: "Image URL (optional)", type: "image", description: "Adds a side image; otherwise the hero is centered." },
  ]
);
