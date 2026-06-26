import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const counterStatsSchema = z.object({
  heading: z.string().default("By the numbers"),
  subheading: z.string().default(""),
  stats: z.array(z.object({
      value: z.string().default("0"),
      suffix: z.string().default(""),
      label: z.string().default(""),
    })).default([
      { value: "120", suffix: "+", label: "Projects Delivered" },
      { value: "98", suffix: "%", label: "Client Satisfaction" },
      { value: "8", suffix: "", label: "Years Experience" },
      { value: "24", suffix: "/7", label: "Support" },
    ]),
});

export type CounterStatsProps = z.input<typeof counterStatsSchema>;

export const CounterStatsModuleDef = createModuleDefinition(
  'CounterStatsModule',
  "Animated Counter / Stats",
  "Numbers that count up when scrolled into view (GSAP).",
  counterStatsSchema,
  [
    { name: "heading", label: "Heading", type: "text" },
    { name: "subheading", label: "Subheading", type: "textarea" },
    {
      name: "stats",
      label: "Stats",
      type: "list",
      itemFields: [
        { name: "value", label: "Number", type: "text", placeholder: "e.g. 120" },
        { name: "suffix", label: "Suffix", type: "text", placeholder: "e.g. +, %, K" },
        { name: "label", label: "Label", type: "text" },
      ],
    },
  ]
);
