import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const parallaxBannerSchema = z.object({
  image: z.string().default(""),
  heading: z.string().default("Where Pixels Meet Logic"),
  subheading: z.string().default("Crafting fast, scalable digital experiences."),
  buttonText: z.string().default(""),
  buttonLink: z.string().default(""),
  intensity: z.string().default("medium"),
  overlay: z.string().default("medium"),
});

export type ParallaxBannerProps = z.input<typeof parallaxBannerSchema>;

export const ParallaxBannerModuleDef = createModuleDefinition(
  'ParallaxBannerModule',
  "Parallax Banner",
  "Full-width banner whose image drifts as you scroll (GSAP).",
  parallaxBannerSchema,
  [
    { name: "image", label: "Background Image", type: "image" },
    { name: "heading", label: "Heading", type: "text" },
    { name: "subheading", label: "Subheading", type: "textarea" },
    { name: "buttonText", label: "Button Text", type: "text", placeholder: "Optional" },
    { name: "buttonLink", label: "Button Link", type: "text", placeholder: "/contact" },
    {
      name: "intensity", label: "Parallax Strength", type: "select",
      options: [
        { label: "Subtle", value: "subtle" },
        { label: "Medium", value: "medium" },
        { label: "Strong", value: "strong" },
      ],
    },
    {
      name: "overlay", label: "Dark Overlay", type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Light", value: "light" },
        { label: "Medium", value: "medium" },
        { label: "Dark", value: "dark" },
      ],
    },
  ]
);
