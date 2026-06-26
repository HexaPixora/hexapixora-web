import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const animatedTextHeroSchema = z.object({
  eyebrow: z.string().default(""),
  heading: z.string().default("Where Pixels Meet Logic"),
  subheading: z.string().default("We design and build fast, scalable digital experiences."),
  buttonText: z.string().default("Get Started"),
  buttonLink: z.string().default("/contact"),
});

export type AnimatedTextHeroProps = z.input<typeof animatedTextHeroSchema>;

export const AnimatedTextHeroModuleDef = createModuleDefinition(
  'AnimatedTextHeroModule',
  "Animated Text Hero",
  "A hero whose heading words reveal with a staggered slide-up (GSAP).",
  animatedTextHeroSchema,
  [
    { name: "eyebrow", label: "Eyebrow", type: "text", placeholder: "Small label above the heading (optional)" },
    { name: "heading", label: "Heading", type: "textarea" },
    { name: "subheading", label: "Subheading", type: "textarea" },
    { name: "buttonText", label: "Button Text", type: "text" },
    { name: "buttonLink", label: "Button Link", type: "text" },
  ]
);
