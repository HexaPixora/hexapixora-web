import type { ReactNode } from "react";

/** Section backgrounds from theme tokens; theme packs can restyle them via data-surface. */
const SURFACES = { default: "", raised: "bg-page-raised", brand: "bg-brand" } as const;

export type Surface = keyof typeof SURFACES;

/** The background class for sections that draw their own frame (heroes). */
export const surfaceClass = (surface: Surface) => SURFACES[surface];

/**
 * The outer <section> of every block. The section itself is full-bleed (its
 * border and `backdrop` span the screen); the content sits in the centred
 * page-width column so wide screens never stretch it. `data-block` and
 * `data-variant` are the stable hooks theme packs target to restyle a block.
 */
export function SectionFrame({
  block,
  variant,
  surface = "default",
  labelledBy,
  className = "",
  innerClassName = "",
  backdrop,
  children,
}: {
  block: string;
  variant?: string;
  surface?: Surface;
  labelledBy?: string;
  className?: string;
  innerClassName?: string;
  /** Decorative full-bleed layer behind the content (e.g. a film canvas). */
  backdrop?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      data-block={block}
      data-variant={variant}
      data-surface={surface === "default" ? undefined : surface}
      aria-labelledby={labelledBy}
      className={`relative border-t border-line py-section ${SURFACES[surface]} ${className}`}
    >
      {backdrop}
      <div className={`page-width relative ${innerClassName}`}>{children}</div>
    </section>
  );
}
