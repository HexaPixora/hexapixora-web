import { z } from 'zod';
import { defineBlock } from './define-block';
import { chapterFields, chapterShape } from './section-fields';

export const pillarsSchema = z.object({
  ...chapterShape,
  chapter: z.string().default("03"),
  heading: z.string().default("What we build"),
  aside: z.string().default("Nine services"),
  items: z.array(z.object({
    label: z.string().default(""),
    title: z.string().default(""),
    text: z.string().default(""),
    // One service per line; "Name | /link" makes it a link.
    services: z.string().default(""),
  })).default([
    { label: "01 / Build", title: "Build", text: "Fast, secure products built on a modern stack and made to scale.", services: "Web design & development\nApp development\nCustom software & platforms" },
    { label: "02 / Design", title: "Design", text: "Interfaces and identities that look sharp and turn visitors into customers.", services: "UI/UX design\nBranding & identity\nGraphic & motion design" },
    { label: "03 / Grow", title: "Grow", text: "Campaigns and content that bring the right people to what we built.", services: "Digital marketing & SEO\nSocial media management\nPerformance advertising" },
  ]),
});

export type PillarsProps = z.input<typeof pillarsSchema>;

export const PillarsDef = defineBlock(
  'pillars',
  "Service Pillars",
  "Large rows, one per service group, each with its list of services.",
  pillarsSchema,
  [
    ...chapterFields,
    {
      name: "items", label: "Pillars", type: "list", itemFields: [
        { name: "label", label: "Label", type: "text", placeholder: "01 / Build" },
        { name: "title", label: "Title", type: "text" },
        { name: "text", label: "Text", type: "textarea" },
        { name: "services", label: "Services", type: "textarea", description: "One per line. Add a link with \" | /services/web\"." },
      ],
    },
  ]
);
