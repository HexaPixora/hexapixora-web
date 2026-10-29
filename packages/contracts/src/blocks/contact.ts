import { z } from "zod";
import { defineBlock } from "./define-block";
import { headFields, headShape, layoutField, surfaceField, surfaceShape } from "./shared";

export const contactSchema = z.object({
  layout: z.enum(["form"]).default("form"),
  ...headShape,
  anchorId: z.string().default("contact"),
  heading: z.string().default("Start a project"),
  intro: z.string().default("Tell us what you need. We reply within one business day."),
  email: z.string().default("hello@hexapixora.com"),
  phone: z.string().default(""),
  ...surfaceShape,
});

export type ContactConfig = z.infer<typeof contactSchema>;

export const ContactDef = defineBlock(
  "contact",
  "Contact",
  "The enquiry form, with your email and phone beside it.",
  contactSchema,
  [
    layoutField([{ label: "Form", value: "form" }]),
    ...headFields,
    { name: "email", label: "Email", type: "text" },
    { name: "phone", label: "Phone", type: "text", description: "Optional. Leave empty to hide." },
    surfaceField,
  ],
);
