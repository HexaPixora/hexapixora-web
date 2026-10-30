import { BLOCK_GROUPS, BLOCKS } from "./library";
import type { ModuleDefinition } from "./types";

export type { ModuleFieldType, ModuleField, ModuleDefinition, Section } from "./types";

/**
 * The blocks editors can add: the block library (plans/phase-3c). Old block
 * types are no longer offered; stored ones move to the library through
 * legacy/migrate.ts.
 */
export const MODULES: Record<string, ModuleDefinition> = BLOCKS;

/**
 * Anchor id for in-page links (#contact, #faq). Every library block keeps its
 * anchor in its config; contact and faq default to "contact" and "faq".
 */
export function resolveAnchorId(_type: string, config: unknown): string {
  const anchorId = (config as { anchorId?: unknown } | null)?.anchorId;
  return typeof anchorId === "string" ? anchorId.trim() : "";
}

export type ModuleGroup = { label: string; modules: ModuleDefinition[] };

/** The blocks grouped for the editor's picker, in display order. */
export function groupedModules(): ModuleGroup[] {
  return BLOCK_GROUPS.map((group) => ({ label: group.label, modules: group.blocks.map((id) => BLOCKS[id]) }));
}
