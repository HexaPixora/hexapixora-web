import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const quoteSchema = z.object({
  eyebrow: z.string().default(""),
  quote: z.string().default(
    "Great design isn't decoration. It's the clearest expression of what a company believes — made visible, made usable, and made unforgettable.",
  ),
  avatar: z.string().default(""),
  name: z.string().default("Umair Breet"),
  title: z.string().default("Founder & CEO"),
  accentColor: z.string().default("#1093fd"),
});

export type QuoteProps = z.input<typeof quoteSchema>;

export const QuoteModuleDef = createModuleDefinition(
  'QuoteModule',
  "Featured Quote",
  "A single standout quote on a floating glass card with a quote-mark medallion straddling the top edge — a distinctive centerpiece for a leadership or about page.",
  quoteSchema,
  [
    { name: "eyebrow", label: "Eyebrow / Label", type: "text", description: "Small label above the quote. Leave empty to hide." },
    { name: "quote", label: "Quote", type: "textarea" },
    { name: "avatar", label: "Author photo", type: "image", description: "Optional small round avatar." },
    { name: "name", label: "Author name", type: "text" },
    { name: "title", label: "Author title / role", type: "text" },
    { name: "accentColor", label: "Accent color", type: "color", description: "Tints the medallion, border glow and divider." },
  ],
);
