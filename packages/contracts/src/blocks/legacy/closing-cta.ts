import { z } from 'zod';
import { defineBlock } from '../define-block';
import { linkFields } from '../section-fields';

export const closingCtaSchema = z.object({
  anchorId: z.string().default(""),
  variant: z.enum(["film", "plain"]).default("film"),
  titleTop: z.string().default("Your project"),
  titleBottom: z.string().default("is next."),
  text: z.string().default("Tell us the idea. We reply within one business day with a plan and a price."),
  ctaText: z.string().default("Start a project"),
  ctaUrl: z.string().default("/contact-us"),
});

export type ClosingCtaProps = z.input<typeof closingCtaSchema>;

export const ClosingCtaDef = defineBlock(
  'closing-cta',
  "Closing Call to Action",
  "A full-height closing statement with one button.",
  closingCtaSchema,
  [
    { name: "variant", label: "Background", type: "select", options: [{ label: "Moving film", value: "film" }, { label: "Plain", value: "plain" }] },
    { name: "titleTop", label: "Title line 1", type: "text" },
    { name: "titleBottom", label: "Title line 2", type: "text" },
    { name: "text", label: "Text", type: "textarea" },
    ...linkFields("cta", "Button"),
    { name: "anchorId", label: "Anchor ID", type: "text" },
  ]
);
