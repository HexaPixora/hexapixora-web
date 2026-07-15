import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const richTextSchema = z.object({
  heading: z.string().default(""),
  lastUpdated: z.string().default(""),
  content: z.string().default("<p>Add your content here.</p>"),
});

export type RichTextProps = z.input<typeof richTextSchema>;

export const RichTextModuleDef = createModuleDefinition(
  'RichTextModule',
  "Rich Text / Legal",
  "A clean, readable long-form text page (privacy policy, terms, cookie policy, etc.) with an optional title and 'last updated' line.",
  richTextSchema,
  [
    { name: "heading", label: "Page title", type: "text", description: "e.g. Privacy Policy. Leave empty to hide." },
    { name: "lastUpdated", label: "Last updated line", type: "text", placeholder: "Last updated: July 2025", description: "Optional small line under the title." },
    { name: "content", label: "Content", type: "richtext", description: "Full document body — headings, lists and links are supported." },
  ],
);
