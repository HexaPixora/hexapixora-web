import type { ReactNode } from "react";
import Link from "next/link";
import { isExternalHref, safeHref } from "@hexapixora/contracts/links";

/**
 * A navigation link from CMS data: internal paths use next/link (client-side
 * navigation and prefetch), external ones a plain <a> with a safe `rel`.
 * Unsafe URLs render the label as text.
 */
export function NavLink({
  href,
  newTab = false,
  className,
  current = false,
  onClick,
  children,
}: {
  href: string | undefined;
  newTab?: boolean;
  className?: string;
  current?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  const url = safeHref(href);
  if (!url) return <span className={className}>{children}</span>;

  if (isExternalHref(url) || /^(mailto|tel):/i.test(url)) {
    return (
      <a
        href={url}
        className={className}
        onClick={onClick}
        target={newTab ? "_blank" : undefined}
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={url}
      className={className}
      onClick={onClick}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
      aria-current={current ? "page" : undefined}
    >
      {children}
    </Link>
  );
}

/** Active when the path matches the link or sits under it (/insights/x → /insights). */
export function isActivePath(pathname: string, url: string | undefined): boolean {
  if (!url || url === "#" || !url.startsWith("/")) return false;
  const path = url.split("#")[0]!.split("?")[0]!;
  if (!path) return false;
  return pathname === path || (path !== "/" && pathname.startsWith(`${path}/`));
}
