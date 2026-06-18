import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const leadMagnetSchema = z.object({
  heading: z.string().default("Free guide: 10 ways to grow your traffic"),
  subheading: z.string().default("Enter your details and we'll send the download straight to your screen."),
  resourceTitle: z.string().default("The Growth Playbook (PDF)"),
  // The file visitors receive — upload to the Media Library and paste its URL.
  resourceUrl: z.string().default(""),
  buttonText: z.string().default("Get the free guide"),
  coverImage: z.string().default(""),
  backgroundColor: z.string().default("#0f172a"),
});

export type LeadMagnetProps = z.input<typeof leadMagnetSchema>;

export const LeadMagnetModuleDef = createModuleDefinition(
  'LeadMagnetModule',
  "Lead Magnet / Gated Download",
  "Capture a name + email in exchange for a downloadable resource. Creates a CRM lead and reveals the download.",
  leadMagnetSchema,
  [
    { name: "heading", label: "Heading", type: "text" },
    { name: "subheading", label: "Subheading", type: "textarea" },
    { name: "resourceTitle", label: "Resource Title", type: "text" },
    { name: "resourceUrl", label: "Resource File URL (PDF, etc.)", type: "image", description: "Upload your file to the Media Library and select it here." },
    { name: "buttonText", label: "Button Text", type: "text" },
    { name: "coverImage", label: "Cover Image (optional)", type: "image" },
    { name: "backgroundColor", label: "Background Color (Hex)", type: "color" },
  ],
);
