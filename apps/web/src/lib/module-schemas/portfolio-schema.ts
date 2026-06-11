import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const portfolioSchema = z.object({
  heading: z.string().default("Featured Work"),
  subheading: z.string().default("Some of our recent projects"),
  items: z.array(z.object({
      title: z.string(),
      category: z.string(),
      image: z.string()
    })).default([{"title":"E-commerce Platform","category":"Web Development","image":""},{"title":"Finance Dashboard","category":"UI/UX Design","image":""}]),
});

export type PortfolioProps = z.input<typeof portfolioSchema>;

export const PortfolioSectionDef = createModuleDefinition(
  'PortfolioSection',
  "Portfolio Showcase",
  "Displays recent portfolio projects.",
  portfolioSchema,
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
        label: "Projects",
        type: "list",
        itemFields: [
            {
                name: "title",
                label: "Project Title",
                type: "text"
            },
            {
                name: "category",
                label: "Category",
                type: "text"
            },
            {
                name: "image",
                label: "Project Image URL",
                type: "image"
            }
        ]
    }
]
);
