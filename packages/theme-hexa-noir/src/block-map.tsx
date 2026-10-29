import type { ComponentType } from "react";
import dynamic from "next/dynamic";

type BlockComponent = ComponentType<{ config?: unknown }>;

/**
 * Stored block type → component for the cinematic section blocks. Each block
 * is its own chunk, so a page only loads the blocks it uses. The renderer
 * merges this map into its own until Phase 3.4 moves the renderer here.
 */
export const NOIR_BLOCKS: Record<string, BlockComponent> = {
  "film-hero": dynamic(() => import("./blocks/film-hero/film-hero-block").then((m) => m.FilmHeroBlock)),
  statement: dynamic(() => import("./blocks/statement/statement-block").then((m) => m.StatementBlock)),
  crew: dynamic(() => import("./blocks/crew/crew-block").then((m) => m.CrewBlock)),
  pillars: dynamic(() => import("./blocks/pillars/pillars-block").then((m) => m.PillarsBlock)),
  "case-files": dynamic(() => import("./blocks/case-files/case-files-block").then((m) => m.CaseFilesBlock)),
  lab: dynamic(() => import("./blocks/lab/lab-block").then((m) => m.LabBlock)),
  "process-steps": dynamic(() => import("./blocks/process-steps/process-steps-block").then((m) => m.ProcessStepsBlock)),
  "faq-list": dynamic(() => import("./blocks/faq-list/faq-list-block").then((m) => m.FaqListBlock)),
  "closing-cta": dynamic(() => import("./blocks/closing-cta/closing-cta-block").then((m) => m.ClosingCtaBlock)),
};
