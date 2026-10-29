import { z } from "zod";
import { defineBlock } from "./define-block";
import { headFields, headShape, layoutField, surfaceField, surfaceShape } from "./shared";

export const postsSchema = z.object({
  layout: z.enum(["grid"]).default("grid"),
  ...headShape,
  heading: z.string().default("Latest insights"),
  limit: z.enum(["3", "6", "9"]).default("3"),
  ...surfaceShape,
});

export type PostsConfig = z.infer<typeof postsSchema>;

export const PostsDef = defineBlock("posts", "Latest insights", "The newest published articles.", postsSchema, [
  layoutField([{ label: "Grid", value: "grid" }]),
  ...headFields,
  {
    name: "limit",
    label: "How many",
    type: "select",
    options: [
      { label: "3", value: "3" },
      { label: "6", value: "6" },
      { label: "9", value: "9" },
    ],
  },
  surfaceField,
]);
