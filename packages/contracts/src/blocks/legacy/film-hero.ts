import { z } from 'zod';
import { defineBlock } from '../define-block';
import { linkFields } from '../section-fields';

export const filmHeroSchema = z.object({
  variant: z.enum(["film", "plain"]).default("film"),
  titleTop: z.string().default("Where pixels"),
  titleBottom: z.string().default("meet logic"),
  subline: z.string().default("One senior lead. A hand-picked crew for every project. Websites, apps and platforms that load in under a second."),
  ctaText: z.string().default("Start a project"),
  ctaUrl: z.string().default("#contact"),
  scrollHint: z.string().default("Scroll for more"),
});

export type FilmHeroProps = z.input<typeof filmHeroSchema>;

export const FilmHeroDef = defineBlock(
  'film-hero',
  "Film Hero",
  "Full-screen headline over four tiles of moving light. The page's main heading.",
  filmHeroSchema,
  [
    { name: "variant", label: "Background", type: "select", options: [{ label: "Moving film tiles", value: "film" }, { label: "Plain", value: "plain" }] },
    { name: "titleTop", label: "Title line 1", type: "text" },
    { name: "titleBottom", label: "Title line 2 (right-aligned)", type: "text" },
    { name: "subline", label: "Subline", type: "textarea" },
    ...linkFields("cta", "Button"),
    { name: "scrollHint", label: "Scroll hint", type: "text" },
  ]
);
