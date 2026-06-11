import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const aboutSchema = z.object({
  heading: z.string().default("About HexaPixora"),
  content: z.string().default("We are a digital agency passionate about building great products. With years of experience and a highly skilled team, we deliver scalable solutions."),
  image: z.string().default(""),
});

export type AboutProps = z.input<typeof aboutSchema>;

export const AboutSectionDef = createModuleDefinition(
  'AboutSection',
  "About Us",
  "A split section with image and text.",
  aboutSchema,
  [
    {
        name: "heading",
        label: "Heading",
        type: "text"
    },
    {
        name: "content",
        label: "Content",
        type: "textarea"
    },
    {
        name: "image",
        label: "Image URL",
        type: "image"
    }
]
);
