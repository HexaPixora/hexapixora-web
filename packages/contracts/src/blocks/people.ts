import { z } from "zod";
import { defineBlock } from "./define-block";
import { headFields, headShape, layoutField, surfaceField, surfaceShape } from "./shared";

export const personSchema = z.object({
  /** A person's name (photos) or a role (roles). */
  title: z.string().default(""),
  /** A role (photos) or availability (roles). */
  label: z.string().default(""),
  text: z.string().default(""),
  image: z.string().default(""),
  url: z.string().default(""),
  lead: z.boolean().default(false),
});

export const peopleSchema = z.object({
  layout: z.enum(["roles", "photos"]).default("roles"),
  ...headShape,
  heading: z.string().default("One lead. The right crew."),
  items: z.array(personSchema).default([]),
  note: z.string().default(""),
  ...surfaceShape,
});

export type PeopleConfig = z.infer<typeof peopleSchema>;

export const PeopleDef = defineBlock("people", "People", "The crew as roles, or a team with photos.", peopleSchema, [
  layoutField([
    { label: "Roles (no faces)", value: "roles" },
    { label: "Photos", value: "photos" },
  ]),
  ...headFields,
  {
    name: "items",
    label: "People",
    type: "list",
    itemFields: [
      { name: "title", label: "Name or role", type: "text" },
      { name: "label", label: "Role or availability", type: "text" },
      { name: "text", label: "Text", type: "textarea", showFor: ["roles"] },
      { name: "image", label: "Photo", type: "image", showFor: ["photos"] },
      { name: "url", label: "Profile link", type: "text", showFor: ["photos"] },
      { name: "lead", label: "Lead", type: "boolean", showFor: ["roles"] },
    ],
  },
  { name: "note", label: "Note", type: "text" },
  surfaceField,
]);
