import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const staggeredGridSchema = z.object({
  heading: z.string().default("Featured"),
  subheading: z.string().default(""),
  items: z.array(z.object({
      image: z.string().default(""),
      title: z.string().default(""),
      text: z.string().default(""),
      link: z.string().default(""),
    })).default([
      { image: "", title: "One", text: "A short description of this item.", link: "" },
      { image: "", title: "Two", text: "A short description of this item.", link: "" },
      { image: "", title: "Three", text: "A short description of this item.", link: "" },
    ]),
});

export type StaggeredGridProps = z.input<typeof staggeredGridSchema>;

export const StaggeredGridModuleDef = createModuleDefinition(
  'StaggeredGridModule',
  "Staggered Reveal Grid",
  "A grid of cards that cascade in as you scroll (GSAP).",
  staggeredGridSchema,
  [
    { name: "heading", label: "Heading", type: "text" },
    { name: "subheading", label: "Subheading", type: "textarea" },
    {
      name: "items",
      label: "Cards",
      type: "list",
      itemFields: [
        { name: "image", label: "Image", type: "image" },
        { name: "title", label: "Title", type: "text" },
        { name: "text", label: "Text", type: "textarea" },
        { name: "link", label: "Link", type: "text", placeholder: "Optional" },
      ],
    },
  ]
);
