import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const leaderSchema = z.object({
  kicker: z.string().default("A Letter From Our CEO"),
  quote: z.string().default("We don't just build websites. We build the reason people remember you."),
  letter: z.string().default(
    "When we started HexaPixora, we made one promise: never ship anything we wouldn't be proud to put our name on. Every pixel, every line of code, every decision runs through that filter.\n\nThat's still how we work today — and it's exactly why the brands we partner with keep coming back.",
  ),
  portrait: z.string().default(""),
  portraitCaption: z.string().default(""),
  signature: z.string().default("Umair Breet"),
  name: z.string().default("Umair Breet"),
  title: z.string().default("Founder & CEO"),
  accentColor: z.string().default("#1093fd"),
  stats: z.array(z.object({
      value: z.string().default(""),
      label: z.string().default(""),
    })).default([
      { value: "8+", label: "Years leading" },
      { value: "120+", label: "Projects shipped" },
      { value: "40+", label: "Brands partnered" },
    ]),
});

export type LeaderProps = z.input<typeof leaderSchema>;

export const LeaderModuleDef = createModuleDefinition(
  'LeaderModule',
  "Leader / CEO",
  "An editorial 'letter from the CEO' — display-serif pull quote, handwritten signature and an offset-framed portrait. Deliberately breaks from the glass theme.",
  leaderSchema,
  [
    { name: "kicker", label: "Kicker / Label", type: "text", description: "Small uppercase label above the quote. Leave empty to hide." },
    { name: "quote", label: "Pull quote", type: "textarea", description: "The headline statement, set in a display serif." },
    { name: "letter", label: "Letter body", type: "textarea", description: "1–2 short paragraphs. Separate paragraphs with a blank line." },
    { name: "portrait", label: "Portrait photo", type: "image", description: "A tall (4:5) portrait works best." },
    { name: "portraitCaption", label: "Photo caption", type: "text", description: "Optional magazine-style caption under the photo." },
    { name: "signature", label: "Signature", type: "text", description: "Rendered in a handwritten script." },
    { name: "name", label: "Name", type: "text" },
    { name: "title", label: "Title / Role", type: "text" },
    { name: "accentColor", label: "Accent color", type: "color", description: "Tints the offset frame, rule and signature." },
    {
      name: "stats",
      label: "Credibility stats",
      type: "list",
      itemFields: [
        { name: "value", label: "Value", type: "text", placeholder: "120+" },
        { name: "label", label: "Label", type: "text", placeholder: "Projects shipped" },
      ],
    },
  ],
);
