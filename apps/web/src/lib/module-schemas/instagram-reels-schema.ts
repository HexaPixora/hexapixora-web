import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const instagramReelsSchema = z.object({
  eyebrow: z.string().default("On Instagram"),
  heading: z.string().default("Latest from the feed"),
  subheading: z.string().default("A look at what we've been designing, building and shipping lately."),
  reels: z.array(z.object({
      url: z.string().default(""),
    })).default([
      { url: "" },
      { url: "" },
      { url: "" },
    ]),
  ctaLabel: z.string().default("Follow us on Instagram"),
  ctaUrl: z.string().default(""),
});

export type InstagramReelsProps = z.input<typeof instagramReelsSchema>;

export const InstagramReelsModuleDef = createModuleDefinition(
  'InstagramReelsModule',
  "Instagram Reels",
  "A responsive wall of embedded Instagram reels — up to 4 per row, auto-centering when there are fewer.",
  instagramReelsSchema,
  [
    { name: "eyebrow", label: "Eyebrow / Label", type: "text", description: "Leave empty to hide." },
    { name: "heading", label: "Heading", type: "text" },
    { name: "subheading", label: "Subheading", type: "textarea" },
    {
      name: "reels",
      label: "Reels",
      type: "list",
      description: "Paste the reel link (e.g. https://www.instagram.com/reel/ABC123/). Up to 4 sit in one row; more wrap to the next.",
      itemFields: [
        { name: "url", label: "Reel URL", type: "text", placeholder: "https://www.instagram.com/reel/ABC123/" },
      ],
    },
    { name: "ctaLabel", label: "CTA label", type: "text", description: "Optional button under the reels." },
    { name: "ctaUrl", label: "CTA link (Instagram profile)", type: "text", placeholder: "https://www.instagram.com/hexapixora" },
  ],
);
