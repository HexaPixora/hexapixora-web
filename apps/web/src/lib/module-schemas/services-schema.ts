import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const servicesSchema = z.object({
  heading: z.string().default("Our Services"),
  subheading: z.string().default("What we can do for you"),
  buttonText: z.string().default("Learn More"),
  items: z.array(z.object({
      title: z.string().default(""),
      description: z.string().default(""),
      icon: z.string().default(""),
      link: z.string().default(""),
      // Per-card colors. Empty = use the theme color; set a hex to override.
      iconColor: z.string().default(""),
      buttonColor: z.string().default(""),
    })).default([
      { title: "Web Development", description: "Custom web applications built with modern tools.", icon: "code", link: "", iconColor: "", buttonColor: "" },
      { title: "UI/UX Design", description: "Beautiful and intuitive user interfaces.", icon: "pen-tool", link: "", iconColor: "", buttonColor: "" },
      { title: "Digital Marketing", description: "Grow your business with targeted campaigns.", icon: "trending-up", link: "", iconColor: "", buttonColor: "" },
    ]),
});

export type ServicesProps = z.input<typeof servicesSchema>;

export const ServicesSectionDef = createModuleDefinition(
  'ServicesSection',
  "Services Grid",
  "A grid of services with lucide icons and a per-card button (text/link/colors).",
  servicesSchema,
  [
    { name: "heading", label: "Heading", type: "text" },
    { name: "subheading", label: "Subheading", type: "textarea" },
    {
      name: "buttonText",
      label: "Button Text",
      type: "text",
      placeholder: "Learn More",
      description: "Shared label for every card's button (the button only shows when a link is set).",
    },
    {
      name: "items",
      label: "Services",
      type: "list",
      itemFields: [
        { name: "title", label: "Title", type: "text" },
        { name: "description", label: "Description", type: "textarea" },
        {
          name: "icon",
          label: "Icon",
          type: "text",
          defaultValue: "wrench",
          placeholder: "e.g. code, pen-tool, rocket",
          description: "Any icon name from lucide.dev (e.g. code, pen-tool, trending-up).",
        },
        {
          name: "link",
          label: "Button Link",
          type: "text",
          placeholder: "/contact or https://…",
          description: "Where the button goes. Leave blank to hide this card's button.",
        },
        { name: "iconColor", label: "Icon Color", type: "color", description: "Leave blank to use the theme color." },
        { name: "buttonColor", label: "Button Color", type: "color", description: "Leave blank to use the theme color." },
      ]
    }
  ]
);
