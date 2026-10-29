import type { ReactNode } from "react";
import { isExternalHref, safeHref } from "@hexapixora/contracts/links";

/**
 * An <a> for CMS-provided URLs. Unsafe or empty URLs render nothing (or just
 * the text with `keepText`), and links that leave the site get
 * `rel="noopener noreferrer"`.
 */
export function SafeLink({
  href,
  className,
  keepText = false,
  children,
}: {
  href: string | undefined;
  className?: string;
  keepText?: boolean;
  children: ReactNode;
}) {
  const url = safeHref(href);
  if (!url) return keepText ? <>{children}</> : null;
  return (
    <a href={url} className={className} rel={isExternalHref(url) ? "noopener noreferrer" : undefined}>
      {children}
    </a>
  );
}

/** The pill button shape shared by every call to action. */
export const PILL_CLASS =
  "inline-flex items-center gap-2.5 rounded-pill font-extrabold transition-colors duration-300";
