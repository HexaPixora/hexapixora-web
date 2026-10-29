import { z } from "zod";
import { defineBlock } from "./define-block";
import { headFields, headShape, layoutField, surfaceField, surfaceShape } from "./shared";

export const faqSchema = z.object({
  layout: z.enum(["list"]).default("list"),
  ...headShape,
  anchorId: z.string().default("faq"),
  heading: z.string().default("Questions"),
  items: z
    .array(z.object({ question: z.string().default(""), answer: z.string().default("") }))
    .default([{ question: "How long does a website take?", answer: "Most sites take two to six weeks." }]),
  /** Adds FAQPage structured data so search engines can show the answers. */
  structuredData: z.boolean().default(true),
  ...surfaceShape,
});

export type FaqConfig = z.infer<typeof faqSchema>;

export const FaqDef = defineBlock(
  "faq",
  "FAQ",
  "Questions and answers, with structured data for search engines.",
  faqSchema,
  [
    layoutField([{ label: "List", value: "list" }]),
    ...headFields,
    {
      name: "items",
      label: "Questions",
      type: "list",
      itemFields: [
        { name: "question", label: "Question", type: "text" },
        { name: "answer", label: "Answer", type: "textarea" },
      ],
    },
    {
      name: "structuredData",
      label: "Structured data",
      type: "boolean",
      description: "Turn off if another FAQ on the same page already has it.",
    },
    surfaceField,
  ],
);
