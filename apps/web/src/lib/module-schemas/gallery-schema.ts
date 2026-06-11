import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const gallerySchema = z.object({
  heading: z.string().default("Our Gallery"),
  columns: z.string().default("3"),
  images: z.array(z.object({
      url: z.string(),
      caption: z.string()
    })).default([]),
});

export type GalleryProps = z.input<typeof gallerySchema>;

export const GalleryModuleDef = createModuleDefinition(
  'GalleryModule',
  "Image Gallery",
  "A responsive grid gallery for images.",
  gallerySchema,
  [
    {
        name: "heading",
        label: "Heading",
        type: "text"
    },
    {
        name: "columns",
        label: "Grid Columns",
        type: "select",
        options: [
            {
                label: "2 Columns",
                value: "2"
            },
            {
                label: "3 Columns",
                value: "3"
            },
            {
                label: "4 Columns",
                value: "4"
            }
        ]
    },
    {
        name: "images",
        label: "Gallery Images",
        type: "list",
        itemFields: [
            {
                name: "url",
                label: "Image",
                type: "image"
            },
            {
                name: "caption",
                label: "Caption (Optional)",
                type: "text"
            }
        ]
    }
]
);
