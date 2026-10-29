import { z } from 'zod';
import type { ModuleField } from './types';

// Fields shared by the cinematic section blocks: an anchor for in-page links
// and the chapter row ("01 / The studio") that doubles as the section's <h2>.

export const chapterShape = {
  anchorId: z.string().default(""),
  chapter: z.string().default(""),
  heading: z.string().default(""),
  aside: z.string().default(""),
};

export const chapterFields: ModuleField[] = [
  { name: "chapter", label: "Chapter number", type: "text", placeholder: "01" },
  { name: "heading", label: "Section heading", type: "text", description: "Shown in the chapter row; it is the section's main heading for search engines." },
  { name: "aside", label: "Chapter note (right)", type: "text" },
  { name: "anchorId", label: "Anchor ID", type: "text", description: "For links like #process. Letters, numbers and dashes." },
];

export const linkFields = (prefix: string, label: string): ModuleField[] => [
  { name: `${prefix}Text`, label: `${label} text`, type: "text" },
  { name: `${prefix}Url`, label: `${label} link`, type: "text", placeholder: "/contact-us or https://…" },
];
