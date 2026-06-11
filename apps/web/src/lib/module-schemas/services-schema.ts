import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const servicesSchema = z.object({
  heading: z.string().default("Our Services"),
  subheading: z.string().default("What we can do for you"),
  items: z.array(z.object({
      title: z.string(),
      description: z.string(),
      icon: z.string()
    })).default([{"title":"Web Development","description":"Custom web applications built with modern tools.","icon":"Code"},{"title":"UI/UX Design","description":"Beautiful and intuitive user interfaces.","icon":"PenTool"},{"title":"Digital Marketing","description":"Grow your business with targeted campaigns.","icon":"TrendingUp"}]),
});

export type ServicesProps = z.input<typeof servicesSchema>;

export const ServicesSectionDef = createModuleDefinition(
  'ServicesSection',
  "Services Grid",
  "Displays a grid of your services.",
  servicesSchema,
  [
    {
        name: "heading",
        label: "Heading",
        type: "text"
    },
    {
        name: "subheading",
        label: "Subheading",
        type: "textarea"
    },
    {
        name: "items",
        label: "Services",
        type: "list",
        itemFields: [
            {
                name: "title",
                label: "Title",
                type: "text"
            },
            {
                name: "description",
                label: "Description",
                type: "textarea"
            },
            {
                name: "icon",
                label: "Icon (Lucide name)",
                type: "text",
                defaultValue: "Wrench"
            }
        ]
    }
]
);
