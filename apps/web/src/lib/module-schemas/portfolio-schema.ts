import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const portfolioSchema = z.object({
  heading: z.string().default("Featured Work"),
  subheading: z.string().default("Some of our recent projects"),
  items: z.array(z.object({
      title: z.string().default(""),
      // Selected from the shared category pool (stored as names).
      categories: z.array(z.string()).default([]),
      // Legacy single free-text value — still rendered if present.
      category: z.string().optional(),
      image: z.string().default("")
    })).default([
      { title: "E-commerce Platform", categories: ["Web Development"], image: "" },
      { title: "Finance Dashboard", categories: ["UI/UX Design"], image: "" },
    ]),
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
                name: "categories",
                label: "Categories",
                type: "categories"
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
