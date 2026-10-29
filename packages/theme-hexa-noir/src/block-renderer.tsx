import React from "react";
import { resolveAnchorId } from "@hexapixora/contracts/blocks/registry";
import { migrateSection, type Section } from "@hexapixora/contracts/blocks/legacy/migrate";
import { LEGACY_BLOCKS, LIBRARY_BLOCKS } from "./block-map";
import { MediaAltProvider } from "./components/media-alt-provider";
import type { BlockProps } from "./lib/block-props";

/**
 * A stored block type this theme has no component for. Visitors see nothing
 * (an empty box would be thin content); developers get a note.
 */
function DefaultSection({ type, label }: { type: string; label?: string }) {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <section data-block="unknown" className="border-t border-line py-16">
      <div className="page-width">
        <p className="mono border border-dashed border-line p-8 text-copy-dim">
          No component for <span className="text-signal">{type}</span>
          {label && label !== type ? ` (${label})` : ""}
        </p>
      </div>
    </section>
  );
}

type Resolved = { type: string; config: Record<string, unknown>; Block?: React.ComponentType<BlockProps> };

/**
 * What to render for a stored section. Old sections move to the block library
 * on the fly (plans/phase-3c), so a page looks the same before and after its
 * stored data is migrated. An empty section uses the module defaults.
 */
function resolve(section: Section, moduleDefaults: Record<string, Record<string, unknown>>): Resolved {
  const fallback = moduleDefaults[section.type];
  const moved = migrateSection(section, fallback);
  const library = moved ? LIBRARY_BLOCKS[moved.type as keyof typeof LIBRARY_BLOCKS] : undefined;
  if (moved && library) return { type: moved.type, config: moved.config ?? {}, Block: library };

  const own = section.config && Object.keys(section.config).length > 0 ? section.config : (fallback ?? {});
  return { type: section.type, config: own, Block: LEGACY_BLOCKS[section.type] };
}

interface BlockRendererProps {
  sections: Section[];
  moduleDefaults: Record<string, Record<string, unknown>>;
  // filename -> alt text from the media library (GET /media/alt-text)
  altTexts?: Record<string, string>;
  /** Latest published posts, loaded by the app when a page has a blog block. */
  latestPosts?: unknown[];
}

export function BlockRenderer({ sections, moduleDefaults, altTexts, latestPosts }: BlockRendererProps) {
  if (!sections || sections.length === 0) {
    return null;
  }

  // Track anchor ids already used on this page so we never emit a duplicate id.
  const usedAnchors = new Set<string>();

  return (
    <MediaAltProvider altTexts={altTexts}>
      {sections
        .filter((s) => s.isVisible)
        .map((section, index) => {
          const { type, config, Block } = resolve(section, moduleDefaults);
          if (!Block) return <DefaultSection key={section.id} type={section.type} label={section.label} />;

          // Anchor id for in-page links (#contact, #faq, …). First section to
          // claim an id wins; duplicates are dropped to keep the HTML valid.
          const candidate = resolveAnchorId(type, config);
          const anchor = candidate && !usedAnchors.has(candidate) ? candidate : "";
          if (anchor) usedAnchors.add(anchor);

          // Blocks run their own entrance motion, so they render as they are.
          const content = <Block config={config} first={index === 0} posts={latestPosts} />;

          return anchor ? (
            <div key={section.id} id={anchor} className="scroll-mt-24">
              {content}
            </div>
          ) : (
            <React.Fragment key={section.id}>{content}</React.Fragment>
          );
        })}
    </MediaAltProvider>
  );
}
