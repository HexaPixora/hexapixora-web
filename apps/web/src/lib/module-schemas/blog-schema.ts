import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const blogSchema = z.object({
  heading: z.string().default("Latest Insights"),
  subheading: z.string().default("News and articles from our team"),
  limit: z.string().default("3"),
});

export type BlogProps = z.input<typeof blogSchema>;

export const BlogSectionDef = createModuleDefinition(
  'BlogSection',
  "Latest News",
  "Displays latest blog posts fetched from the CMS.",
  blogSchema,
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
        name: "limit",
        label: "Number of items to show",
        type: "text"
    }
]
);
