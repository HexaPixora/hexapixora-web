import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const teamSchema = z.object({
  heading: z.string().default("Meet the Team"),
  subheading: z.string().default("The people behind the magic"),
  items: z.array(z.object({
      name: z.string(),
      role: z.string(),
      image: z.string(),
      linkedin: z.string()
    })).default([{"name":"John Smith","role":"CEO","image":"","linkedin":"#"}]),
});

export type TeamProps = z.input<typeof teamSchema>;

export const TeamSectionDef = createModuleDefinition(
  'TeamSection',
  "Team Members",
  "Displays team members.",
  teamSchema,
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
        name: "items",
        label: "Members",
        type: "list",
        itemFields: [
            {
                name: "name",
                label: "Name",
                type: "text"
            },
            {
                name: "role",
                label: "Role",
                type: "text"
            },
            {
                name: "image",
                label: "Profile Image URL",
                type: "image"
            },
            {
                name: "linkedin",
                label: "LinkedIn URL",
                type: "text"
            }
        ]
    }
]
);
