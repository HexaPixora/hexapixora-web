"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { NavLink, isActivePath } from "../components/nav-link";
import { PILL_CLASS } from "../components/safe-link";
import type { MenuItem } from "./nav-types";

/**
 * The full-screen menu. A native modal <dialog> gives focus trapping, Escape
 * to close, an inert page behind it and the top layer (no portal needed).
 * The links are also in the page as plain HTML for search engines, because a
 * closed dialog's content is still server-rendered.
 */
export function MenuDialog({
  items,
  ctaText,
  ctaUrl,
}: {
  items: MenuItem[];
  ctaText: string;
  ctaUrl: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "/";
  const titleId = useId();

  const close = useCallback(() => dialogRef.current?.close(), []);

  // Keep page scroll locked while the menu is open.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  // A route change (e.g. browser back) closes the menu.
  useEffect(() => {
    close();
  }, [pathname, close]);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          dialogRef.current?.showModal();
          setOpen(true);
        }}
        className="mono flex items-center gap-3 transition-colors duration-300 hover:text-signal"
      >
        <span className="sr-only sm:not-sr-only">Menu</span>
        <span
          aria-hidden="true"
          className="block h-[22px] w-[22px] bg-[radial-gradient(circle,var(--color-copy)_1.5px,transparent_2px)] bg-[length:7px_7px]"
        />
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
        className="m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-page text-copy backdrop:bg-page/80"
      >
        <div className="page-width flex min-h-full flex-col py-5">
          <div className="flex items-center justify-between">
            <h2 id={titleId} className="mono text-copy-dim">
              Menu
            </h2>
            <button type="button" onClick={close} className="mono transition-colors duration-300 hover:text-signal">
              Close <span aria-hidden="true">✕</span>
            </button>
          </div>

          <nav aria-label="Full menu" className="flex-1 py-12">
            <ul className="grid gap-10 md:grid-cols-2 md:gap-x-16">
              {items.map((item) => (
                <li key={item.id}>
                  <NavLink
                    href={item.url}
                    newTab={item.target === "_blank"}
                    current={isActivePath(pathname, item.url)}
                    onClick={close}
                    className="wide text-display-md font-medium transition-colors duration-300 hover:text-signal aria-[current=page]:text-signal"
                  >
                    {item.label}
                  </NavLink>
                  {item.children && item.children.length > 0 ? (
                    <ul className="mt-4 grid gap-2">
                      {item.children.map((child) => (
                        <li key={child.id}>
                          <NavLink
                            href={child.url}
                            newTab={child.target === "_blank"}
                            current={isActivePath(pathname, child.url)}
                            onClick={close}
                            className="mono text-copy-dim transition-colors duration-300 hover:text-copy aria-[current=page]:text-signal"
                          >
                            {child.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            {ctaText ? (
              <NavLink
                href={ctaUrl}
                onClick={close}
                className={`${PILL_CLASS} bg-signal px-6 py-3.5 text-sm text-on-signal`}
              >
                {ctaText} <span aria-hidden="true">→</span>
              </NavLink>
            ) : null}
            <NavLink href="/search" onClick={close} className="mono transition-colors duration-300 hover:text-signal">
              Search the site
            </NavLink>
          </div>
        </div>
      </dialog>
    </>
  );
}
