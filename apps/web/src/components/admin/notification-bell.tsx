"use client";

import React, { useEffect, useRef, useState } from "react";
import { Bell, BellRing, Check } from "lucide-react";
import { useNotifications } from "@/lib/use-notifications";

const TYPE_EMOJI: Record<string, string> = {
  LEAD: "🎯",
  CHAT_HANDOFF: "💬",
  CHAT_MESSAGE: "💬",
  NEWSLETTER: "✉️",
  SYSTEM: "🔔",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d < 7 ? `${d}d ago` : new Date(iso).toLocaleDateString();
}

export function NotificationBell({ enabled }: { enabled: boolean }) {
  const { items, unread, refreshList, markAllRead, markRead, permission, requestPermission } =
    useNotifications(enabled);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) refreshList();
  }, [open, refreshList]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (!enabled) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        title="Notifications"
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border bg-card shadow-lg">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <p className="text-sm font-semibold">Notifications</p>
            {items.some((n) => !n.read) && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>

          {permission === "default" && (
            <button
              onClick={requestPermission}
              className="flex w-full items-center gap-2 border-b bg-primary/5 px-4 py-2.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
            >
              <BellRing size={14} /> Enable desktop notifications
            </button>
          )}

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                You&apos;re all caught up.
              </p>
            ) : (
              items.map((n) => {
                const body = (
                  <div
                    className={`flex gap-3 border-b px-4 py-3 transition-colors last:border-0 hover:bg-muted/40 ${
                      !n.read ? "bg-primary/[0.04]" : ""
                    }`}
                  >
                    <span className="mt-0.5 text-lg leading-none">{TYPE_EMOJI[n.type] || "🔔"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{n.title}</p>
                      {n.body && <p className="line-clamp-2 text-xs text-muted-foreground">{n.body}</p>}
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />}
                  </div>
                );
                return n.link ? (
                  <a
                    key={n.id}
                    href={n.link}
                    onClick={() => {
                      markRead(n.id);
                      setOpen(false);
                    }}
                  >
                    {body}
                  </a>
                ) : (
                  <button key={n.id} onClick={() => markRead(n.id)} className="block w-full text-left">
                    {body}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
