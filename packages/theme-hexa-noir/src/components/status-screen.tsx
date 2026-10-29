import type { ReactNode } from "react";

/**
 * A full-height notice for 404s and errors: a large code in the background
 * register, the page's <h1>, one line and the way out.
 */
export function StatusScreen({
  code,
  title,
  intro,
  children,
}: {
  code: string;
  title: string;
  intro: string;
  children?: ReactNode;
}) {
  return (
    <section data-part="status-screen" className="page-width grid min-h-[70vh] content-center py-section">
      <p aria-hidden="true" className="wide text-display-xl font-bold text-copy/10">
        {code}
      </p>
      <h1 className="wide -mt-[0.35em] max-w-[18ch] text-display-md font-medium">{title}</h1>
      <p className="mt-6 max-w-[48ch] text-lg text-copy-dim">{intro}</p>
      {children ? <div className="mt-10 flex flex-wrap gap-3">{children}</div> : null}
    </section>
  );
}
