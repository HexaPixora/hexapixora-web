import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const ourStorySchema = z.object({
  eyebrow: z.string().default("Our Story"),
  heading: z.string().default("The journey so far"),
  subheading: z.string().default("From a small idea to a full-service digital studio — here's how we got here."),
  milestones: z.array(z.object({
      year: z.string().default(""),
      title: z.string().default(""),
      description: z.string().default(""),
    })).default([
      { year: "2019", title: "The beginning", description: "Founded with a simple mission: build digital products people genuinely love." },
      { year: "2021", title: "Growing the team", description: "Expanded into a multidisciplinary team of designers, engineers and strategists." },
      { year: "2023", title: "Scaling up", description: "Partnered with brands across industries to ship premium products at scale." },
      { year: "Today", title: "Pushing boundaries", description: "Crafting fast, beautiful, unmistakable experiences for clients worldwide." },
    ]),
});

export type OurStoryProps = z.input<typeof ourStorySchema>;

export const OurStoryModuleDef = createModuleDefinition(
  'OurStoryModule',
  "Our Story",
  "A narrative journey with year-by-year milestones on a glass timeline.",
  ourStorySchema,
  [
    { name: "eyebrow", label: "Eyebrow / Label", type: "text", description: "Leave empty to hide." },
    { name: "heading", label: "Heading", type: "text" },
    { name: "subheading", label: "Subheading", type: "textarea" },
    {
      name: "milestones",
      label: "Milestones",
      type: "list",
      itemFields: [
        { name: "year", label: "Year / Label", type: "text", placeholder: "2019" },
        { name: "title", label: "Title", type: "text" },
        { name: "description", label: "Description", type: "textarea" },
      ],
    },
  ]
);
