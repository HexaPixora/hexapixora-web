"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, CornerDownLeft, FileText, Plus, Search } from "lucide-react";
import { apiClient } from "@hexapixora/sdk/browser";
import { Dialog, DialogContent, DialogTitle } from "@hexapixora/ui/dialog";
import { cn } from "@hexapixora/ui/cn";
import { NAV_GROUPS, type NavItem } from "./nav";

type Entry = {
  group: "Go to" | "Actions" | "Pages" | "Insights";
  label: string;
  hint?: string;
  href: string;
  icon: React.ComponentType<{ size?: number }>;
};

type Listed = { id: string; title?: string; slug?: string; status?: string };

const asList = (value: unknown): Listed[] => (Array.isArray(value) ? (value as Listed[]) : []);

/**
 * Ctrl+K (or ⌘K): jump to any admin screen, page or insight, or start a new
 * one. Pages and insights load the first time the menu opens, and only for
 * people who may edit them.
 */
export function CommandMenu({
  open,
  onOpenChange,
  canSee,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canSee: (item: NavItem) => boolean;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [content, setContent] = useState<Entry[] | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const canPages = canSee({ href: "", label: "", icon: FileText, permission: "pages" });
  const canBlogs = canSee({ href: "", label: "", icon: BookOpen, permission: "blogs" });

  useEffect(() => {
    if (!open || content) return;
    Promise.all([
      canPages ? apiClient.get("/pages/admin/list").catch(() => null) : null,
      canBlogs ? apiClient.get("/blogs", { params: { limit: 100 } }).catch(() => null) : null,
    ]).then(([pagesRes, blogsRes]) => {
      const pages = asList(pagesRes?.data?.data).map<Entry>((page) => ({
        group: "Pages",
        label: page.title || "Untitled page",
        hint: `/${page.slug ?? ""}`,
        href: `/admin/pages/${page.id}`,
        icon: FileText,
      }));
      const posts = asList(blogsRes?.data?.data).map<Entry>((post) => ({
        group: "Insights",
        label: post.title || "Untitled post",
        hint: post.status ? post.status.toLowerCase() : undefined,
        href: `/admin/blogs/${post.id}/edit`,
        icon: BookOpen,
      }));
      setContent([...pages, ...posts]);
    });
  }, [open, content, canPages, canBlogs]);

  const entries = useMemo(() => {
    const screens = NAV_GROUPS.flatMap((group) => group.items)
      .filter(canSee)
      .map<Entry>((item) => ({ group: "Go to", label: item.label, href: item.href, icon: item.icon }));
    const actions: Entry[] = [
      ...(canPages ? [{ group: "Actions" as const, label: "New page", href: "/admin/pages", icon: Plus }] : []),
      ...(canBlogs ? [{ group: "Actions" as const, label: "New insight", href: "/admin/blogs/create", icon: Plus }] : []),
    ];
    const all = [...screens, ...actions, ...(content ?? [])];
    const q = query.trim().toLowerCase();
    if (!q) return [...screens, ...actions];
    return all.filter((entry) => `${entry.label} ${entry.hint ?? ""}`.toLowerCase().includes(q)).slice(0, 40);
  }, [query, content, canSee, canPages, canBlogs]);

  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (entry: Entry | undefined) => {
    if (entry) window.location.href = entry.href;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, entries.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(entries[active]);
    }
  };

  let lastGroup = "";
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setQuery("");
      }}
    >
      <DialogContent showCloseButton={false} className="top-[12vh] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogTitle className="sr-only">Search the admin</DialogTitle>
        <div className="flex items-center gap-3 border-b px-4">
          <Search size={16} className="text-muted-foreground" aria-hidden="true" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Jump to a page, insight or screen…"
            aria-label="Search"
            aria-controls="command-results"
            aria-activedescendant={entries[active] ? `command-${active}` : undefined}
            className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
        </div>
        <ul id="command-results" ref={listRef} role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
          {entries.length === 0 ? (
            <li className="px-3 py-6 text-center text-muted-foreground">
              {content ? "Nothing matches." : "Searching…"}
            </li>
          ) : null}
          {entries.map((entry, i) => {
            const heading = entry.group !== lastGroup ? entry.group : null;
            lastGroup = entry.group;
            return (
              <li key={`${entry.group}-${entry.href}-${i}`} role="presentation">
                {heading ? (
                  <p className="px-3 pb-1 pt-3 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                    {heading}
                  </p>
                ) : null}
                <a
                  id={`command-${i}`}
                  role="option"
                  aria-selected={i === active}
                  data-index={i}
                  href={entry.href}
                  onMouseMove={() => setActive(i)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm",
                    i === active ? "bg-accent text-accent-foreground" : "text-foreground",
                  )}
                >
                  <entry.icon size={15} />
                  <span className="truncate">{entry.label}</span>
                  {entry.hint ? (
                    <span className="ml-auto truncate font-mono text-xs text-muted-foreground">{entry.hint}</span>
                  ) : null}
                  {i === active ? <CornerDownLeft size={13} className="text-muted-foreground" aria-hidden="true" /> : null}
                </a>
              </li>
            );
          })}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
