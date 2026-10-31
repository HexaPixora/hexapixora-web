"use client";

import { useEffect, useState } from "react";
import { Menu, Search } from "lucide-react";
import { NotificationBell } from "@/components/admin/notification-bell";
import { itemFor } from "./nav";

/** The admin's top bar: where you are, the search, the active theme and notifications. */
export function AdminTopbar({
  pathname,
  onMenu,
  onSearch,
  notifications,
}: {
  pathname: string;
  onMenu: () => void;
  onSearch: () => void;
  /** Starts the notification bell once the session is known. */
  notifications: boolean;
}) {
  const section = itemFor(pathname);
  const [themeName, setThemeName] = useState("");
  const [mac, setMac] = useState(false);

  useEffect(() => {
    // Set by the root layout, which reads the active theme on the server.
    setThemeName(document.documentElement.dataset.themeName ?? "");
    setMac(/Mac|iPhone|iPad/.test(navigator.platform));
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur md:px-7">
      <button type="button" className="text-muted-foreground md:hidden" onClick={onMenu} aria-label="Open navigation">
        <Menu size={20} />
      </button>
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Admin</span>
        {section && section.href !== "/admin" ? (
          <>
            <span className="text-muted-foreground">/</span>
            <span className="truncate font-semibold">{section.label}</span>
          </>
        ) : (
          <>
            <span className="text-muted-foreground">/</span>
            <span className="font-semibold">Dashboard</span>
          </>
        )}
      </nav>

      <button
        type="button"
        onClick={onSearch}
        className="ml-auto flex min-w-0 items-center gap-2.5 border bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-muted-foreground sm:w-80"
      >
        <Search size={15} aria-hidden="true" />
        <span className="hidden truncate sm:inline">Search pages, insights, screens…</span>
        <kbd className="ml-auto hidden whitespace-nowrap border px-1.5 font-mono text-[11px] sm:inline">{mac ? "⌘K" : "Ctrl K"}</kbd>
      </button>

      {themeName ? (
        <a
          href="/admin/themes"
          title="The admin follows the active theme"
          className="hidden items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] lg:flex"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" />
          {themeName}
        </a>
      ) : null}

      <NotificationBell enabled={notifications} />
    </header>
  );
}
