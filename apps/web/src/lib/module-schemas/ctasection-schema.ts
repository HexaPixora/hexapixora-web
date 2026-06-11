import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const ctasectionSchema = z.object({
  title: z.string().default("Ready to get started?"),
  subtitle: z.string().default("Join us today and transform your business."),
  buttonText: z.string().default("Get in Touch"),
  buttonUrl: z.string().default("/contact"),
  backgroundColor: z.string().default("#0f172a"),
});

export type CTAProps = z.input<typeof ctasectionSchema>;

export const CTASectionDef = createModuleDefinition(
  'CTASection',
  "Call to Action",
  "A simple block to drive conversions.",
  ctasectionSchema,
  [
    {
        name: "title",
        label: "Title",
        type: "text"
    },
    {
        name: "subtitle",
        label: "Subtitle",
        type: "textarea"
    },
    {
        name: "buttonText",
        label: "Button Text",
        type: "text"
    },
    {
        name: "buttonUrl",
        label: "Button URL",
        type: "text"
    },
    {
        name: "backgroundColor",
        label: "Background Color (Hex)",
        type: "color"
    }
]
);
