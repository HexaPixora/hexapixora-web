import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const splideGallerySyncSchema = z.object({
  heading: z.string().default("Bespoke Visual Gallery"),
  height: z.string().default("450px"),
  items: z.array(z.object({
      image: z.string().default(""),
      title: z.string().default(""),
      description: z.string().default("")
    })).default([]),
});

export type SplideGallerySyncProps = z.input<typeof splideGallerySyncSchema>;

export const SplideGallerySyncModuleDef = createModuleDefinition(
  'SplideGallerySyncModule',
  "Splide Synced Gallery",
  "A synchronized dual-slider gallery (large main slide synchronized with thumbnails navigation below).",
  splideGallerySyncSchema,
  [
    {
        name: "heading",
        label: "Section Heading",
        type: "text"
    },
    {
        name: "height",
        label: "Main Slide Height",
        type: "text"
    },
    {
        name: "items",
        label: "Gallery Images",
        type: "list",
        itemFields: [
            {
                name: "image",
                label: "Image",
                type: "image"
            },
            {
                name: "title",
                label: "Caption Title (Optional)",
                type: "text"
            },
            {
                name: "description",
                label: "Caption Description (Optional)",
                type: "text"
            }
        ]
    }
]
);
