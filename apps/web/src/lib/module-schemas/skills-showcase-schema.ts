import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const skillsShowcaseSchema = z.object({
  eyebrow: z.string().default("Skills"),
  heading: z.string().default("Skills & Technologies"),
  subheading: z.string().default(""),
  name: z.string().default(""),
  role: z.string().default(""),
  avatar: z.string().default(""),
  skills: z.array(z.object({
      name: z.string().default(""),
      level: z.string().default("80"),
    })).default([
      { name: "React / Next.js", level: "95" },
      { name: "TypeScript", level: "90" },
      { name: "Node.js / NestJS", level: "85" },
      { name: "UI / UX Design", level: "80" },
      { name: "Tailwind CSS", level: "92" },
      { name: "PostgreSQL", level: "78" },
    ]),
});

export type SkillsShowcaseProps = z.input<typeof skillsShowcaseSchema>;

export const SkillsShowcaseModuleDef = createModuleDefinition(
  'SkillsShowcaseModule',
  "Skills & Technologies",
  "A person's technology skills shown as labelled proficiency bars.",
  skillsShowcaseSchema,
  [
    { name: "eyebrow", label: "Eyebrow / Label", type: "text", description: "Leave empty to hide." },
    { name: "heading", label: "Heading", type: "text" },
    { name: "subheading", label: "Subheading", type: "textarea" },
    { name: "name", label: "Person Name (optional)", type: "text" },
    { name: "role", label: "Role (optional)", type: "text" },
    { name: "avatar", label: "Avatar URL (optional)", type: "image" },
    {
      name: "skills",
      label: "Skills",
      type: "list",
      itemFields: [
        { name: "name", label: "Technology / Skill", type: "text", placeholder: "React" },
        { name: "level", label: "Proficiency (0–100)", type: "text", placeholder: "90" },
      ],
    },
  ]
);
