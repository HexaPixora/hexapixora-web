import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const techStackSchema = z.object({
  eyebrow: z.string().default("Our Stack"),
  heading: z.string().default("Technologies we build with"),
  subheading: z.string().default("We pick the right tools for the job — modern, proven and built to scale."),
  technologies: z.array(z.object({
      name: z.string().default(""),
      icon: z.string().default(""),
      category: z.string().default(""),
    })).default([
      { name: "React", icon: "", category: "Frontend" },
      { name: "Next.js", icon: "", category: "Frontend" },
      { name: "TypeScript", icon: "", category: "Frontend" },
      { name: "Tailwind CSS", icon: "", category: "Frontend" },
      { name: "Node.js", icon: "", category: "Backend" },
      { name: "NestJS", icon: "", category: "Backend" },
      { name: "PostgreSQL", icon: "", category: "Backend" },
      { name: "Prisma", icon: "", category: "Backend" },
      { name: "Figma", icon: "", category: "Design" },
      { name: "Vercel", icon: "", category: "Infra" },
    ]),
});

export type TechStackProps = z.input<typeof techStackSchema>;

export const TechStackModuleDef = createModuleDefinition(
  'TechStackModule',
  "Technologies We Use",
  "A grouped grid of your tech stack — logo + name, optionally grouped by category.",
  techStackSchema,
  [
    { name: "eyebrow", label: "Eyebrow / Label", type: "text", description: "Leave empty to hide." },
    { name: "heading", label: "Heading", type: "text" },
    { name: "subheading", label: "Subheading", type: "textarea" },
    {
      name: "technologies",
      label: "Technologies",
      type: "list",
      itemFields: [
        { name: "name", label: "Name", type: "text", placeholder: "React" },
        { name: "icon", label: "Logo URL (optional)", type: "image" },
        { name: "category", label: "Category (optional)", type: "text", placeholder: "Frontend" },
      ],
    },
  ]
);
