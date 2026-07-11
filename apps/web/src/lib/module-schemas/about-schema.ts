import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const aboutSchema = z.object({
  eyebrow: z.string().default("About Us"),
  heading: z.string().default("About HexaPixora"),
  content: z.string().default("We are a digital agency passionate about building great products. With years of experience and a highly skilled team, we deliver scalable solutions."),
  image: z.string().default(""),
  highlights: z.array(z.object({
      title: z.string().default(""),
      description: z.string().default(""),
    })).default([
      { title: "Our Mission", description: "To build scalable digital solutions for modern businesses." },
      { title: "Our Vision", description: "To become the industry standard for enterprise architecture." },
    ]),
  buttonText: z.string().default("Learn More About Us"),
  buttonUrl: z.string().default("/about"),
});

export type AboutProps = z.input<typeof aboutSchema>;

export const AboutSectionDef = createModuleDefinition(
  'AboutSection',
  "About Us",
  "A split image + text section with highlights and a CTA.",
  aboutSchema,
  [
    { name: "eyebrow", label: "Eyebrow / Label", type: "text", description: "Small badge above the heading. Leave empty to hide." },
    { name: "heading", label: "Heading", type: "text" },
    { name: "content", label: "Content", type: "textarea" },
    { name: "image", label: "Image URL", type: "image" },
    {
      name: "highlights",
      label: "Highlights (e.g. Mission / Vision)",
      type: "list",
      itemFields: [
        { name: "title", label: "Title", type: "text" },
        { name: "description", label: "Description", type: "textarea" },
      ],
    },
    { name: "buttonText", label: "Button Text", type: "text", description: "Leave empty to hide the button." },
    { name: "buttonUrl", label: "Button URL", type: "text" },
  ]
);
