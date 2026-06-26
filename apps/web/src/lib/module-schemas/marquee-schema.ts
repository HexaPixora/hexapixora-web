import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const marqueeSchema = z.object({
  items: z.array(z.object({
      text: z.string().default(""),
      image: z.string().default(""),
    })).default([
      { text: "Design", image: "" },
      { text: "Development", image: "" },
      { text: "Branding", image: "" },
      { text: "Strategy", image: "" },
      { text: "Performance", image: "" },
    ]),
  speed: z.string().default("normal"),
  direction: z.string().default("left"),
});

export type MarqueeProps = z.input<typeof marqueeSchema>;

export const MarqueeModuleDef = createModuleDefinition(
  'MarqueeModule',
  "Marquee Ticker",
  "An infinite, seamless scrolling row of text or logos (GSAP).",
  marqueeSchema,
  [
    {
      name: "items",
      label: "Items",
      type: "list",
      itemFields: [
        { name: "text", label: "Text", type: "text", placeholder: "Leave blank if using an image" },
        { name: "image", label: "Logo / Image", type: "image" },
      ],
    },
    {
      name: "speed", label: "Speed", type: "select",
      options: [
        { label: "Slow", value: "slow" },
        { label: "Normal", value: "normal" },
        { label: "Fast", value: "fast" },
      ],
    },
    {
      name: "direction", label: "Direction", type: "select",
      options: [
        { label: "Left", value: "left" },
        { label: "Right", value: "right" },
      ],
    },
  ]
);
