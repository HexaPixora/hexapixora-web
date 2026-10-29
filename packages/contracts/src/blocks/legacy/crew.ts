import { z } from 'zod';
import { defineBlock } from './define-block';
import { chapterFields, chapterShape } from './section-fields';

export const crewSchema = z.object({
  ...chapterShape,
  chapter: z.string().default("02"),
  heading: z.string().default("One lead. The right crew."),
  aside: z.string().default("Roles, not faces"),
  items: z.array(z.object({
    role: z.string().default(""),
    availability: z.string().default(""),
    description: z.string().default(""),
    lead: z.boolean().default(false),
  })).default([
    { role: "Lead developer", availability: "Every project", description: "Architecture, code and delivery. Your one contact.", lead: true },
    { role: "Product designer", availability: "When needed", description: "Interfaces, design systems and prototypes.", lead: false },
    { role: "Brand & motion artist", availability: "When needed", description: "Identity, illustration and animation.", lead: false },
    { role: "Backend engineer", availability: "When needed", description: "APIs, databases, integrations and scaling.", lead: false },
    { role: "Mobile engineer", availability: "When needed", description: "iOS and Android apps.", lead: false },
    { role: "Growth specialist", availability: "When needed", description: "SEO, social and paid campaigns.", lead: false },
  ]),
  note: z.string().default("Every specialist is someone the lead has worked with before. No anonymous outsourcing."),
});

export type CrewProps = z.input<typeof crewSchema>;

export const CrewDef = defineBlock(
  'crew',
  "Crew Dossier",
  "A grid of roles (not faces); the lead role is highlighted.",
  crewSchema,
  [
    ...chapterFields,
    {
      name: "items", label: "Roles", type: "list", itemFields: [
        { name: "role", label: "Role", type: "text" },
        { name: "availability", label: "Label", type: "text", placeholder: "Every project" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "lead", label: "Highlight as lead", type: "boolean" },
      ],
    },
    { name: "note", label: "Footnote", type: "textarea" },
  ]
);
