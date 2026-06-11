import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const splideLogoTickerSchema = z.object({
  heading: z.string().default("Brands that trust us"),
  speed: z.string().default("1"),
  perPage: z.string().default("5"),
  logos: z.array(z.object({
      image: z.string(),
      name: z.string()
    })).default([]),
});

export type SplideLogoTickerProps = z.input<typeof splideLogoTickerSchema>;

export const SplideLogoTickerModuleDef = createModuleDefinition(
  'SplideLogoTickerModule',
  "Splide Logo Ticker",
  "An infinite loop auto-scrolling ticker to display client or partner logos.",
  splideLogoTickerSchema,
  [
    {
        name: "heading",
        label: "Section Heading (Optional)",
        type: "text"
    },
    {
        name: "speed",
        label: "Scrolling Speed (Higher is faster)",
        type: "text"
    },
    {
        name: "perPage",
        label: "Visible Logos count",
        type: "select",
        options: [
            {
                label: "3 Logos",
                value: "3"
            },
            {
                label: "4 Logos",
                value: "4"
            },
            {
                label: "5 Logos",
                value: "5"
            },
            {
                label: "6 Logos",
                value: "6"
            },
            {
                label: "8 Logos",
                value: "8"
            }
        ]
    },
    {
        name: "logos",
        label: "Logos list",
        type: "list",
        itemFields: [
            {
                name: "image",
                label: "Logo Image",
                type: "image"
            },
            {
                name: "name",
                label: "Company Name",
                type: "text"
            }
        ]
    }
]
);
