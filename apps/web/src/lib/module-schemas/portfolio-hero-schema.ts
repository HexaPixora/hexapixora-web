import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const portfolioHeroSchema = z.object({
  eyebrow: z.string().default("Portfolio"),
  name: z.string().default("Alex Rivera"),
  title: z.string().default("Senior Product Designer & Creative Developer"),
  bio: z.string().default("I design and build premium digital products where craft meets clarity — interfaces that feel effortless, fast, and unmistakably yours."),
  image: z.string().default(""),
  availability: z.string().default("Available for new projects"),
  skills: z.array(z.object({
      label: z.string().default(""),
    })).default([
      { label: "Product Design" },
      { label: "React / Next.js" },
      { label: "Framer Motion" },
      { label: "Design Systems" },
      { label: "TypeScript" },
    ]),
  stats: z.array(z.object({
      value: z.string().default(""),
      label: z.string().default(""),
    })).default([
      { value: "8+", label: "Years Experience" },
      { value: "120+", label: "Projects Shipped" },
      { value: "40+", label: "Happy Clients" },
      { value: "15", label: "Awards" },
    ]),
  ctas: z.array(z.object({
      label: z.string().default(""),
      url: z.string().default("#"),
      style: z.string().default("primary"),
    })).default([
      { label: "View Projects", url: "#", style: "primary" },
      { label: "Get in Touch", url: "#contact", style: "secondary" },
    ]),
  socials: z.array(z.object({
      platform: z.string().default("website"),
      url: z.string().default("#"),
    })).default([
      { platform: "dribbble", url: "#" },
      { platform: "linkedin", url: "#" },
      { platform: "github", url: "#" },
    ]),
});

export type PortfolioHeroProps = z.input<typeof portfolioHeroSchema>;

const SOCIAL_OPTIONS = [
  { label: "Website", value: "website" },
  { label: "Dribbble", value: "dribbble" },
  { label: "Behance", value: "behance" },
  { label: "Figma", value: "figma" },
  { label: "LinkedIn", value: "linkedin" },
  { label: "GitHub", value: "github" },
  { label: "X / Twitter", value: "twitter" },
  { label: "Instagram", value: "instagram" },
];

export const PortfolioHeroModuleDef = createModuleDefinition(
  'PortfolioHeroModule',
  "Portfolio Hero",
  "Award-style Liquid-Glass hero for a portfolio profile — floating panels, stats, skills & CTAs.",
  portfolioHeroSchema,
  [
    { name: "eyebrow", label: "Eyebrow / Label", type: "text", placeholder: "Portfolio", description: "Small label above the name. Leave empty to hide." },
    { name: "name", label: "Full Name", type: "text" },
    { name: "title", label: "Professional Title", type: "text", placeholder: "Senior Product Designer" },
    { name: "bio", label: "Short Description", type: "textarea" },
    { name: "image", label: "Profile Image URL", type: "image" },
    { name: "availability", label: "Availability Status", type: "text", placeholder: "Available for new projects", description: "Shows a live status pill. Leave empty to hide." },
    {
      name: "skills",
      label: "Skills / Technologies",
      type: "list",
      itemFields: [
        { name: "label", label: "Skill", type: "text" },
      ],
    },
    {
      name: "stats",
      label: "Statistics (optional)",
      type: "list",
      itemFields: [
        { name: "value", label: "Value", type: "text", placeholder: "120+" },
        { name: "label", label: "Label", type: "text", placeholder: "Projects Shipped" },
      ],
    },
    {
      name: "ctas",
      label: "Call-to-Action Buttons",
      type: "list",
      itemFields: [
        { name: "label", label: "Button Text", type: "text" },
        { name: "url", label: "Link URL", type: "text", placeholder: "#" },
        {
          name: "style",
          label: "Style",
          type: "select",
          options: [
            { label: "Primary (filled)", value: "primary" },
            { label: "Secondary (glass)", value: "secondary" },
            { label: "Ghost (text)", value: "ghost" },
          ],
        },
      ],
    },
    {
      name: "socials",
      label: "Social Links (optional)",
      type: "list",
      itemFields: [
        { name: "platform", label: "Platform", type: "select", options: SOCIAL_OPTIONS },
        { name: "url", label: "URL", type: "text", placeholder: "https://" },
      ],
    },
  ]
);
