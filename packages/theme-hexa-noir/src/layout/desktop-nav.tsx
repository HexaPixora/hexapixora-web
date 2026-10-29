"use client";

import { usePathname } from "next/navigation";
import { NavLink, isActivePath } from "../components/nav-link";
import type { MenuItem } from "./nav-types";

/** Top-level links for wide screens; sub-pages live in the full menu. */
export function DesktopNav({ items }: { items: MenuItem[] }) {
  const pathname = usePathname() ?? "/";
  if (items.length === 0) return null;

  return (
    <nav aria-label="Main" className="hidden lg:block">
      <ul className="flex flex-wrap items-center gap-x-6 gap-y-1">
        {items.map((item) => {
          const active =
            isActivePath(pathname, item.url) || (item.children ?? []).some((child) => isActivePath(pathname, child.url));
          return (
            <li key={item.id}>
              <NavLink
                href={item.url}
                newTab={item.target === "_blank"}
                current={isActivePath(pathname, item.url)}
                className={`mono transition-colors duration-300 hover:text-signal ${active ? "text-signal" : ""}`}
              >
                {item.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
