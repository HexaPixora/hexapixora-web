import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const pricingSchema = z.object({
  heading: z.string().default("Simple, transparent pricing"),
  subheading: z.string().default("Choose the plan that fits your goals. No hidden fees."),
  backgroundColor: z.string().default("#ffffff"),
  plans: z
    .array(
      z.object({
        name: z.string().default(""),
        price: z.string().default(""),
        period: z.string().default(""),
        description: z.string().default(""),
        // One feature per line.
        features: z.string().default(""),
        buttonText: z.string().default(""),
        buttonUrl: z.string().default(""),
        highlighted: z.boolean(),
      }),
    )
    .default([
      {
        name: "Starter",
        price: "$999",
        period: "/ project",
        description: "For small businesses getting online.",
        features: "5-page website\nResponsive design\nBasic SEO\n2 revisions",
        buttonText: "Get started",
        buttonUrl: "/contact",
        highlighted: false,
      },
      {
        name: "Growth",
        price: "$2,499",
        period: "/ project",
        description: "For brands ready to scale.",
        features: "Up to 15 pages\nCustom design\nAdvanced SEO\nCMS + blog\n5 revisions",
        buttonText: "Book a call",
        buttonUrl: "/contact",
        highlighted: true,
      },
      {
        name: "Enterprise",
        price: "Custom",
        period: "",
        description: "For complex, custom builds.",
        features: "Unlimited pages\nCustom web app\nIntegrations\nDedicated support\nSLA",
        buttonText: "Contact sales",
        buttonUrl: "/contact",
        highlighted: false,
      },
    ]),
});

export type PricingProps = z.input<typeof pricingSchema>;

export const PricingModuleDef = createModuleDefinition(
  'PricingModule',
  "Pricing Plans",
  "A responsive pricing table with tiers, features, and CTAs.",
  pricingSchema,
  [
    { name: "heading", label: "Heading", type: "text" },
    { name: "subheading", label: "Subheading", type: "textarea" },
    { name: "backgroundColor", label: "Background Color (Hex)", type: "color" },
    {
      name: "plans",
      label: "Plans",
      type: "list",
      itemFields: [
        { name: "name", label: "Plan Name", type: "text" },
        { name: "price", label: "Price (e.g. $999 or Custom)", type: "text" },
        { name: "period", label: "Period (e.g. / project, / mo)", type: "text" },
        { name: "description", label: "Short Description", type: "text" },
        { name: "features", label: "Features (one per line)", type: "textarea" },
        { name: "buttonText", label: "Button Text", type: "text" },
        { name: "buttonUrl", label: "Button Link", type: "text" },
        { name: "highlighted", label: "Highlight as 'Most Popular'", type: "boolean" },
      ],
    },
  ],
);
