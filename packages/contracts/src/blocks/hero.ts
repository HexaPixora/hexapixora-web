import { z } from "zod";
import { defineBlock } from "./define-block";
import {
  actionsField,
  actionsShape,
  headFields,
  headShape,
  layoutField,
  overlayField,
  overlaySchema,
  surfaceField,
  surfaceShape,
} from "./shared";

export const heroSchema = z.object({
  layout: z.enum(["film", "image", "split", "stats", "type", "profile"]).default("film"),
  ...headShape,
  heading: z.string().default("Where pixels\nmeet logic"),
  intro: z.string().default("Websites, apps and platforms that load in under a second."),
  ...actionsShape,
  /** film: the moving footage behind the title, or a plain page. */
  backdrop: z.enum(["film", "plain"]).default("film"),
  image: z.string().default(""),
  overlay: overlaySchema,
  /** image: how far the background drifts on scroll. */
  motion: z.enum(["none", "subtle", "medium", "strong"]).default("medium"),
  /** A small line: scroll hint (film), founded label (split), availability (profile). */
  note: z.string().default(""),
  stats: z.array(z.object({ value: z.string().default(""), label: z.string().default("") })).default([]),
  tags: z.array(z.object({ label: z.string().default("") })).default([]),
  ...surfaceShape,
});

export type HeroConfig = z.infer<typeof heroSchema>;

export const HeroDef = defineBlock(
  "hero",
  "Hero",
  "The top of a page: the page's main heading, an intro and buttons.",
  heroSchema,
  [
    layoutField([
      { label: "Film (moving footage)", value: "film" },
      { label: "Image background", value: "image" },
      { label: "Text and image", value: "split" },
      { label: "With numbers", value: "stats" },
      { label: "Type only", value: "type" },
      { label: "Profile", value: "profile" },
    ]),
    ...headFields,
    actionsField(),
    {
      name: "backdrop",
      label: "Backdrop",
      type: "select",
      showFor: ["film"],
      options: [
        { label: "Moving film", value: "film" },
        { label: "Plain", value: "plain" },
      ],
    },
    { name: "image", label: "Image", type: "image", showFor: ["image", "split", "profile"] },
    overlayField(["image"]),
    {
      name: "motion",
      label: "Scroll motion",
      type: "select",
      showFor: ["image"],
      options: [
        { label: "None", value: "none" },
        { label: "Subtle", value: "subtle" },
        { label: "Medium", value: "medium" },
        { label: "Strong", value: "strong" },
      ],
    },
    {
      name: "note",
      label: "Small note",
      type: "text",
      showFor: ["film", "split", "profile"],
      description: "Film: scroll hint. Text and image: e.g. Est. 2019. Profile: availability.",
    },
    {
      name: "stats",
      label: "Numbers",
      type: "list",
      showFor: ["stats", "profile"],
      itemFields: [
        { name: "value", label: "Value", type: "text" },
        { name: "label", label: "Label", type: "text" },
      ],
    },
    {
      name: "tags",
      label: "Tags",
      type: "list",
      showFor: ["profile"],
      itemFields: [{ name: "label", label: "Tag", type: "text" }],
    },
    surfaceField,
  ],
);
