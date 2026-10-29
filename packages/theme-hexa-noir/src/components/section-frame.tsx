import type { ReactNode } from "react";

/**
 * The outer <section> of every block. `data-block` and `data-variant` are the
 * stable hooks theme packs target to restyle a block without code.
 */
export function SectionFrame({
  block,
  variant,
  labelledBy,
  className = "",
  children,
}: {
  block: string;
  variant?: string;
  labelledBy?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      data-block={block}
      data-variant={variant}
      aria-labelledby={labelledBy}
      className={`relative border-t border-line py-section gutter-x ${className}`}
    >
      {children}
    </section>
  );
}
