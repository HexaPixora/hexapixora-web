import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

// Curated icon set — the admin picks one per reason from a dropdown. Values map
// to lucide icons in the component (tiny inline SVGs, no image loads).
export const WHY_CHOOSE_ICONS = [
  { label: "Sparkles (Creative)", value: "sparkles" },
  { label: "Zap (Fast)", value: "zap" },
  { label: "Shield (Reliable)", value: "shield" },
  { label: "Rocket (Scale)", value: "rocket" },
  { label: "Award (Quality)", value: "award" },
  { label: "Clock (On-time)", value: "clock" },
  { label: "Users (Team)", value: "users" },
  { label: "Heart (Care)", value: "heart" },
  { label: "Target (Focus)", value: "target" },
  { label: "Trending Up (Results)", value: "trending" },
  { label: "Code (Tech)", value: "code" },
  { label: "Headphones (Support)", value: "support" },
  { label: "Palette (Design)", value: "palette" },
  { label: "Gauge (Performance)", value: "gauge" },
  { label: "Lightbulb (Ideas)", value: "lightbulb" },
  { label: "Thumbs Up (Trust)", value: "thumbs" },
];

export const whyChooseSchema = z.object({
  eyebrow: z.string().default("Why HexaPixora"),
  heading: z.string().default("Why Choose HexaPixora"),
  subheading: z.string().default(
    "We blend design, engineering and strategy to ship digital products that actually move the needle.",
  ),
  items: z.array(z.object({
      icon: z.string().default("sparkles"),
      title: z.string().default(""),
      description: z.string().default(""),
    })).default([
      { icon: "sparkles", title: "Creative by Default", description: "Designs that stand out and stay on-brand — never templated." },
      { icon: "zap", title: "Lightning Performance", description: "Fast, optimized builds that score high on Core Web Vitals." },
      { icon: "shield", title: "Reliable & Secure", description: "Battle-tested foundations you can trust in production." },
      { icon: "rocket", title: "Built to Scale", description: "Architecture that grows with your business, not against it." },
      { icon: "support", title: "Real Human Support", description: "A responsive team that's with you long after launch." },
      { icon: "trending", title: "Results That Matter", description: "We measure success by your growth, not vanity metrics." },
    ]),
});

export type WhyChooseProps = z.input<typeof whyChooseSchema>;

export const WhyChooseModuleDef = createModuleDefinition(
  'WhyChooseModule',
  "Why Choose Us",
  "A glass feature grid of reasons to choose you — icons, titles & descriptions.",
  whyChooseSchema,
  [
    { name: "eyebrow", label: "Eyebrow / Label", type: "text", description: "Small label above the heading. Leave empty to hide." },
    { name: "heading", label: "Heading", type: "text" },
    { name: "subheading", label: "Subheading", type: "textarea" },
    {
      name: "items",
      label: "Reasons",
      type: "list",
      itemFields: [
        { name: "icon", label: "Icon", type: "select", options: WHY_CHOOSE_ICONS },
        { name: "title", label: "Title", type: "text" },
        { name: "description", label: "Description", type: "textarea" },
      ],
    },
  ]
);
