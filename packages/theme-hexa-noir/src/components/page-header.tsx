import type { ReactNode } from "react";

/**
 * The top of a non-block page (insights, search, 404): a small label, the
 * page's only <h1> and an intro line, in the page-width column.
 */
export function PageHeader({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header data-part="page-header" className="page-width pb-chapter pt-24 md:pt-32">
      {eyebrow ? <p className="mono mb-6 text-signal">{eyebrow}</p> : null}
      <h1 className="wide max-w-[18ch] text-display-hero font-medium">{title}</h1>
      {intro ? <p className="mt-6 max-w-[56ch] text-lg text-copy-dim">{intro}</p> : null}
      {children}
    </header>
  );
}
