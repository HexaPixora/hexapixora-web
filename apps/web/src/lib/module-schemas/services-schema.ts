import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const servicesSchema = z.object({
  heading: z.string().default("Our Services"),
  subheading: z.string().default("What we can do for you"),
  // Global styling for all cards. Empty = use the theme color; set a hex to override.
  iconColor: z.string().default(""),
  buttonColor: z.string().default(""),
  buttonTextColor: z.string().default(""),
  items: z.array(z.object({
      title: z.string().default(""),
      description: z.string().default(""),
      icon: z.string().default(""),
      link: z.string().default(""),
      buttonText: z.string().default("Learn More"),
    })).default([
      { title: "Web Development", description: "Custom web applications built with modern tools.", icon: "code", link: "", buttonText: "Learn More" },
      { title: "UI/UX Design", description: "Beautiful and intuitive user interfaces.", icon: "pen-tool", link: "", buttonText: "Learn More" },
      { title: "Digital Marketing", description: "Grow your business with targeted campaigns.", icon: "trending-up", link: "", buttonText: "Learn More" },
    ]),
});

export type ServicesProps = z.input<typeof servicesSchema>;

export const ServicesSectionDef = createModuleDefinition(
  'ServicesSection',
  "Services Grid",
  "A grid of services with lucide icons and a per-card button. Colors are global.",
  servicesSchema,
  [
    { name: "heading", label: "Heading", type: "text" },
    { name: "subheading", label: "Subheading", type: "textarea" },
    { name: "iconColor", label: "Icon Color (all cards)", type: "color", description: "Leave blank to use the theme color." },
    { name: "buttonColor", label: "Button Color (all cards)", type: "color", description: "Leave blank to use the theme color." },
    { name: "buttonTextColor", label: "Button Text Color (all cards)", type: "color", description: "Leave blank for automatic (white on a colored button)." },
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
        {
          name: "buttonText",
          label: "Button Text",
          type: "text",
          placeholder: "Learn More",
          description: "This card's button label (only shows when a link is set).",
        },
      ]
    }
  ]
);
