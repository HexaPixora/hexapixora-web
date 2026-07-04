import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const horizontalScrollSchema = z.object({
  heading: z.string().default("Selected Work"),
  subheading: z.string().default("Scroll to explore"),
  aspectRatio: z.enum(["square", "portrait", "landscape", "wide"]).default("square"),
  items: z.array(z.object({
      image: z.string().default(""),
      title: z.string().default(""),
      subtitle: z.string().default(""),
      link: z.string().default(""),
    })).default([
      { image: "", title: "Project One", subtitle: "Branding", link: "" },
      { image: "", title: "Project Two", subtitle: "Web Design", link: "" },
      { image: "", title: "Project Three", subtitle: "Development", link: "" },
      { image: "", title: "Project Four", subtitle: "Marketing", link: "" },
    ]),
});

export type HorizontalScrollProps = z.input<typeof horizontalScrollSchema>;

export const HorizontalScrollModuleDef = createModuleDefinition(
  'HorizontalScrollModule',
  "Horizontal Scroll Gallery",
  "Cards that scroll sideways as the section pins (GSAP).",
  horizontalScrollSchema,
  [
    { name: "heading", label: "Heading", type: "text" },
    { name: "subheading", label: "Subheading", type: "text" },
    {
      name: "aspectRatio", label: "Card Aspect Ratio", type: "select",
      description: "Shape of every card. Cards share one height; width follows the ratio.",
      options: [
        { label: "Square (1:1)", value: "square" },
        { label: "Portrait (3:4)", value: "portrait" },
        { label: "Landscape (4:3)", value: "landscape" },
        { label: "Wide (16:9)", value: "wide" },
      ],
    },
    {
      name: "items",
      label: "Cards",
      type: "list",
      itemFields: [
        { name: "image", label: "Image", type: "image" },
        { name: "title", label: "Title", type: "text" },
        { name: "subtitle", label: "Subtitle", type: "text" },
        { name: "link", label: "Link", type: "text", placeholder: "/portfolio/… (optional)" },
      ],
    },
  ]
);
