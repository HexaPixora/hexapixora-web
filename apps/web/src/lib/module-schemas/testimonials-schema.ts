import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const testimonialsSchema = z.object({
  heading: z.string().default("What Clients Say"),
  subheading: z.string().default("Don't just take our word for it"),
  backgroundColor: z.string().default("#f8fafc"),
  items: z.array(z.object({
      name: z.string().default(""),
      company: z.string().default(""),
      content: z.string().default(""),
      avatar: z.string().default("")
    })).default([{"name":"Jane Doe","company":"Tech Inc","content":"Incredible work and fast delivery!","avatar":""}]),
});

export type TestimonialsProps = z.input<typeof testimonialsSchema>;

export const TestimonialsSectionDef = createModuleDefinition(
  'TestimonialsSection',
  "Testimonials",
  "Displays client reviews.",
  testimonialsSchema,
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
        name: "backgroundColor",
        label: "Background Color",
        type: "color"
    },
    {
        name: "items",
        label: "Reviews",
        type: "list",
        itemFields: [
            {
                name: "name",
                label: "Client Name",
                type: "text"
            },
            {
                name: "company",
                label: "Company",
                type: "text"
            },
            {
                name: "content",
                label: "Review Content",
                type: "textarea"
            },
            {
                name: "avatar",
                label: "Avatar URL",
                type: "image"
            }
        ]
    }
]
);
