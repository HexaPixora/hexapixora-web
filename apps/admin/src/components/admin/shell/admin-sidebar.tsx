"use client";

import { ExternalLink, LogOut } from "lucide-react";
import { cn } from "@hexapixora/ui/cn";
import { siteUrl } from "@/lib/site-url";
import { NAV_GROUPS, isActive, type NavItem } from "./nav";

export type SidebarUser = { name?: string | null; email?: string | null };

/**
 * The admin's navigation, grouped by job. Plain links (full page loads), so
 * the unsaved-changes warning on editors also covers leaving by the sidebar.
 */
export function AdminSidebar({
  pathname,
  canSee,
  siteName,
  logoUrl,
  newLeads,
  user,
  onLogout,
}: {
  pathname: string;
  canSee: (item: NavItem) => boolean;
  siteName: string;
  logoUrl?: string | null;
  newLeads: number;
  user: SidebarUser | null;
  onLogout: () => void;
}) {
  return (
    <aside className="flex h-full w-64 flex-shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-3 border-b px-5">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- the logo is a media-library file of any type, shown at 32px
          <img src={logoUrl} alt="" className="h-8 w-8 flex-shrink-0 object-contain" />
        ) : (
          <span className="grid h-8 w-8 flex-shrink-0 place-items-center bg-primary font-heading text-xs font-semibold text-primary-foreground">
            {siteName.slice(0, 2).toUpperCase()}
          </span>
        )}
        <span className="truncate font-heading text-sm font-medium">{siteName}</span>
      </div>

      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group, g) => {
          const items = group.items.filter(canSee);
          if (items.length === 0) return null;
          return (
            <div key={group.label ?? g} className="mb-4">
              {group.label ? (
                <p className="mb-1.5 px-3 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  {group.label}
                </p>
              ) : null}
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active = isActive(item, pathname);
                  const count = item.badge === "newLeads" ? newLeads : 0;
                  return (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-2.5 border-l-2 px-3 py-2 text-sm transition-colors",
                          active
                            ? "border-primary bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                            : "border-transparent text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                        )}
                      >
                        <item.icon size={16} aria-hidden="true" />
                        {item.label}
                        {count > 0 ? (
                          <span
                            className="ml-auto rounded-full bg-primary px-1.5 font-mono text-[11px] text-primary-foreground"
                            aria-label={`${count} new`}
                          >
                            {count}
                          </span>
                        ) : null}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="grid gap-3 border-t p-4">
        <a
          href={siteUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors hover:border-muted-foreground"
        >
          <ExternalLink size={14} aria-hidden="true" /> View site
        </a>
        <div className="flex items-center gap-3">
          <a href="/admin/profile" className="flex min-w-0 flex-1 items-center gap-3" title="Your profile">
            <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-secondary text-sm font-semibold">
              {(user?.name?.[0] || user?.email?.[0] || "?").toUpperCase()}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{user?.name || "Admin"}</span>
              <span className="block truncate text-xs text-muted-foreground">{user?.email}</span>
            </span>
          </a>
          <button
            type="button"
            onClick={onLogout}
            className="text-muted-foreground transition-colors hover:text-destructive"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
