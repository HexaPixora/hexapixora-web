import { z } from "zod";
import { defineBlock } from "./define-block";
import { actionSchema, actionsField, headFields, headShape, layoutField, surfaceField, surfaceShape } from "./shared";

export const ctaSchema = z.object({
  layout: z.enum(["band", "closing", "download"]).default("band"),
  ...headShape,
  heading: z.string().default("Your project\nis next."),
  intro: z.string().default("Tell us the idea. We reply within one business day."),
  actions: z.array(actionSchema).default([{ label: "Start a project", url: "/contact-us", style: "primary" }]),
  /** closing: the moving footage behind the title, or a plain page. */
  backdrop: z.enum(["film", "plain"]).default("film"),
  // download: a lead form that hands over a file.
  resourceTitle: z.string().default(""),
  resourceUrl: z.string().default(""),
  submitLabel: z.string().default("Get the free guide"),
  image: z.string().default(""),
  ...surfaceShape,
});

export type CtaConfig = z.infer<typeof ctaSchema>;

export const CtaDef = defineBlock(
  "cta",
  "Call to action",
  "A band with a button, a closing film, or a free download behind a short form.",
  ctaSchema,
  [
    layoutField([
      { label: "Band", value: "band" },
      { label: "Closing (large)", value: "closing" },
      { label: "Free download", value: "download" },
    ]),
    ...headFields,
    actionsField(["band", "closing"]),
    {
      name: "backdrop",
      label: "Backdrop",
      type: "select",
      showFor: ["closing"],
      options: [
        { label: "Moving film", value: "film" },
        { label: "Plain", value: "plain" },
      ],
    },
    {
      name: "resourceTitle",
      label: "Download name",
      type: "text",
      showFor: ["download"],
      placeholder: "The Growth Playbook (PDF)",
    },
    { name: "resourceUrl", label: "Download link", type: "text", showFor: ["download"] },
    { name: "submitLabel", label: "Button text", type: "text", showFor: ["download"] },
    { name: "image", label: "Cover image", type: "image", showFor: ["download"] },
    surfaceField,
  ],
);
