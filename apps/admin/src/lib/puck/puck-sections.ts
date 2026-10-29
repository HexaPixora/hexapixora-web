import type { ComponentData } from "@puckeditor/core";
import { BLOCKS, isBlockId } from "@hexapixora/contracts/blocks/library";
import {
  migrateSection,
  type Section,
} from "@hexapixora/contracts/blocks/legacy/migrate";

/**
 * A stored section's label and visibility travel as these props, so they never
 * clash with a block field (blocks have their own `label` field).
 */
export const LABEL_PROP = "_label";
export const HIDDEN_PROP = "_hidden";

export type StoredSection = {
  id: string;
  type: string;
  label: string;
  isVisible: boolean;
  config: Record<string, unknown>;
};

/**
 * Stored sections → Puck content. Old block types move to the library first
 * (plans/phase-3c), so they open as library blocks. Sections that can't be
 * edited (unknown or removed types) are left out and returned as `dropped`,
 * so the editor can say they will go on the next save.
 */
export function sectionsToPuck(
  sections: Section[],
  moduleDefaults: Record<string, Record<string, unknown>> = {},
): { content: ComponentData[]; dropped: Section[] } {
  const content: ComponentData[] = [];
  const dropped: Section[] = [];
  for (const section of sections) {
    const moved = migrateSection(section, moduleDefaults[section.type]);
    if (!moved || !isBlockId(moved.type)) {
      dropped.push(section);
      continue;
    }
    content.push({
      type: moved.type,
      props: {
        ...(moved.config ?? {}),
        id: moved.id,
        [LABEL_PROP]: moved.label || BLOCKS[moved.type].label,
        [HIDDEN_PROP]: moved.isVisible === false,
      },
    });
  }
  return { content, dropped };
}

/** Props Puck adds or we reserve; everything else is the block's config. */
const NOT_CONFIG = new Set(["id", LABEL_PROP, HIDDEN_PROP, "puck", "editMode"]);

/** A Puck item's props → the block config the theme component renders. */
export function propsToConfig(
  props: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(props).filter(([key]) => !NOT_CONFIG.has(key)),
  );
}

/** Puck content → stored sections, the shape the API saves and the site renders. */
export function puckToSections(content: ComponentData[]): StoredSection[] {
  return content
    .filter((item) => isBlockId(item.type))
    .map((item) => {
      const props = item.props as Record<string, unknown>;
      const label = props[LABEL_PROP];
      return {
        id: String(props.id),
        type: item.type,
        label:
          typeof label === "string" && label.trim()
            ? label
            : BLOCKS[item.type as keyof typeof BLOCKS].label,
        isVisible: props[HIDDEN_PROP] !== true,
        config: propsToConfig(props),
      };
    });
}
