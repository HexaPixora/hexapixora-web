import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const statsSchema = z.object({
  heading: z.string().default("By the Numbers"),
  subheading: z.string().default("Our impact so far"),
  stat1Value: z.string().default("500+"),
  stat1Label: z.string().default("Projects Completed"),
  stat2Value: z.string().default("50+"),
  stat2Label: z.string().default("Team Members"),
  stat3Value: z.string().default("99%"),
  stat3Label: z.string().default("Client Satisfaction"),
  stat4Value: z.string().default("10M+"),
  stat4Label: z.string().default("Revenue Generated"),
});

export type StatsProps = z.input<typeof statsSchema>;

export const StatsSectionDef = createModuleDefinition(
  'StatsSection',
  "Statistics",
  "Displays up to 4 key numbers/statistics.",
  statsSchema,
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
        name: "stat1Value",
        label: "Stat 1 Value",
        type: "text"
    },
    {
        name: "stat1Label",
        label: "Stat 1 Label",
        type: "text"
    },
    {
        name: "stat2Value",
        label: "Stat 2 Value",
        type: "text"
    },
    {
        name: "stat2Label",
        label: "Stat 2 Label",
        type: "text"
    },
    {
        name: "stat3Value",
        label: "Stat 3 Value",
        type: "text"
    },
    {
        name: "stat3Label",
        label: "Stat 3 Label",
        type: "text"
    },
    {
        name: "stat4Value",
        label: "Stat 4 Value",
        type: "text"
    },
    {
        name: "stat4Label",
        label: "Stat 4 Label",
        type: "text"
    }
]
);
