import type { ReactNode } from "react";

/**
 * The outer <section> of every block. The section itself is full-bleed (its
 * border and `backdrop` span the screen); the content sits in the centred
 * page-width column so wide screens never stretch it. `data-block` and
 * `data-variant` are the stable hooks theme packs target to restyle a block.
 */
export function SectionFrame({
  block,
  variant,
  labelledBy,
  className = "",
  innerClassName = "",
  backdrop,
  children,
}: {
  block: string;
  variant?: string;
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
      aria-labelledby={labelledBy}
      className={`relative border-t border-line py-section ${className}`}
    >
      {backdrop}
      <div className={`page-width relative ${innerClassName}`}>{children}</div>
    </section>
  );
}
