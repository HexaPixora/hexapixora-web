import { z } from "zod";
import { defineBlock } from "./define-block";
import { headFields, headShape, layoutField, surfaceField, surfaceShape } from "./shared";

export const galleryItemSchema = z.object({
  image: z.string().default(""),
  title: z.string().default(""),
  text: z.string().default(""),
  url: z.string().default(""),
  linkText: z.string().default(""),
});

export const gallerySchema = z.object({
  layout: z.enum(["grid", "carousel", "viewer"]).default("grid"),
  ...headShape,
  items: z.array(galleryItemSchema).default([]),
  /** grid: images per row on wide screens. */
  columns: z.enum(["2", "3", "4"]).default("3"),
  ...surfaceShape,
});

export type GalleryConfig = z.infer<typeof gallerySchema>;

export const GalleryDef = defineBlock(
  "gallery",
  "Gallery",
  "Images as a grid, a swipeable carousel, or a large viewer with thumbnails.",
  gallerySchema,
  [
    layoutField([
      { label: "Grid", value: "grid" },
      { label: "Carousel", value: "carousel" },
      { label: "Viewer with thumbnails", value: "viewer" },
    ]),
    ...headFields,
    {
      name: "items",
      label: "Images",
      type: "list",
      itemFields: [
        { name: "image", label: "Image", type: "image" },
        {
          name: "title",
          label: "Title",
          type: "text",
          description: "Also the image's description for screen readers.",
        },
        { name: "text", label: "Text", type: "textarea", showFor: ["carousel", "viewer"] },
        { name: "url", label: "Link", type: "text", showFor: ["carousel"] },
        { name: "linkText", label: "Link text", type: "text", showFor: ["carousel"] },
      ],
    },
    {
      name: "columns",
      label: "Columns",
      type: "select",
      showFor: ["grid"],
      options: [
        { label: "2", value: "2" },
        { label: "3", value: "3" },
        { label: "4", value: "4" },
      ],
    },
    surfaceField,
  ],
);
