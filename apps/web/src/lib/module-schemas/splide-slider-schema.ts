import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const splideSliderSchema = z.object({
  heading: z.string().default("Featured Highlights"),
  subheading: z.string().default("Swipe to see some of our key agency features"),
  type: z.string().default("loop"),
  autoplay: z.boolean().default(true),
  interval: z.string().default("5000"),
  speed: z.string().default("800"),
  arrows: z.boolean().default(true),
  pagination: z.boolean().default(true),
  height: z.string().default("500px"),
  items: z.array(z.object({
      image: z.string().default(""),
      title: z.string().default(""),
      description: z.string().default(""),
      buttonText: z.string().default(""),
      buttonUrl: z.string().default("")
    })).default([{"image":"","title":"Scale Your Business","description":"We design top-tier products to boost your operations.","buttonText":"Explore More","buttonUrl":"/services"},{"image":"","title":"Strategic Analytics","description":"Make decisions based on accurate historical insights and real tracking data.","buttonText":"Contact Us","buttonUrl":"/contact"}]),
});

export type SplideSliderProps = z.input<typeof splideSliderSchema>;

export const SplideSliderModuleDef = createModuleDefinition(
  'SplideSliderModule',
  "Splide Image Carousel",
  "A customizable banner slider / image carousel with optional call-to-action details.",
  splideSliderSchema,
  [
    {
        name: "heading",
        label: "Section Heading",
        type: "text"
    },
    {
        name: "subheading",
        label: "Section Subheading",
        type: "textarea"
    },
    {
        name: "type",
        label: "Transition Type",
        type: "select",
        options: [
            {
                label: "Infinite Loop",
                value: "loop"
            },
            {
                label: "Slide",
                value: "slide"
            },
            {
                label: "Fade Effect",
                value: "fade"
            }
        ]
    },
    {
        name: "autoplay",
        label: "Autoplay Enabled",
        type: "boolean"
    },
    {
        name: "interval",
        label: "Autoplay Speed (ms)",
        type: "text"
    },
    {
        name: "speed",
        label: "Slide Transition Speed (ms)",
        type: "text"
    },
    {
        name: "arrows",
        label: "Show Nav Arrows",
        type: "boolean"
    },
    {
        name: "pagination",
        label: "Show Pagination Dots",
        type: "boolean"
    },
    {
        name: "height",
        label: "Slider Height (e.g. 500px, 70vh)",
        type: "text"
    },
    {
        name: "items",
        label: "Slides",
        type: "list",
        itemFields: [
            {
                name: "image",
                label: "Slide Image",
                type: "image"
            },
            {
                name: "title",
                label: "Slide Title",
                type: "text"
            },
            {
                name: "description",
                label: "Slide Description",
                type: "textarea"
            },
            {
                name: "buttonText",
                label: "Button Text (Optional)",
                type: "text"
            },
            {
                name: "buttonUrl",
                label: "Button Link (Optional)",
                type: "text"
            }
        ]
    }
]
);
