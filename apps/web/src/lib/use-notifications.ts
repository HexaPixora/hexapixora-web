"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "@/lib/api-client";

export type AdminNotification = {
  id: string;
  type: "LEAD" | "CHAT_HANDOFF" | "CHAT_MESSAGE" | "NEWSLETTER" | "SYSTEM";
  title: string;
  body?: string | null;
  link?: string | null;
  read: boolean;
  createdAt: string;
};

const POLL_MS = 20_000;

/**
 * Mark-read that SURVIVES navigation. A linked notification navigates the page
 * on click, which aborts a normal fetch/axios request — so the read was never
 * saved and it looked "stuck". `keepalive` lets the request finish as the page
 * unloads. Desktop alerts are handled separately by Web Push (see lib/push).
 */
function markReadBeacon(path: string) {
  try {
    void fetch(`/api${path}`, { method: "POST", credentials: "include", keepalive: true });
  } catch {
    // best-effort
  }
}

export function useNotifications(enabled: boolean) {
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    try {
      const res = await apiClient.get("/notifications", { params: { limit: 30 } });
      const list: AdminNotification[] = Array.isArray(res.data) ? res.data : [];
      setItems(list);
      setUnread(list.filter((n) => !n.read).length);
    } catch {
      // ignore transient failures
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    poll();
    timer.current = setInterval(poll, POLL_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [enabled, poll]);

  const markAllRead = useCallback(async () => {
    setItems((l) => l.map((n) => ({ ...n, read: true })));
    setUnread(0);
    markReadBeacon("/notifications/read-all");
  }, []);

  const markRead = useCallback(async (id: string) => {
    setItems((l) => l.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnread((c) => Math.max(0, c - 1));
    markReadBeacon(`/notifications/${id}/read`);
  }, []);

  return { items, unread, refreshList: poll, markAllRead, markRead };
}
