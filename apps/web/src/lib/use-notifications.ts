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
 * on click, which aborts a normal fetch/axios request — so the server never
 * recorded the read and it looked "stuck". `keepalive` lets the browser finish
 * the request even as the page unloads. Same-origin `/api` proxy sends cookies.
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
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");

  const seen = useRef<Set<string>>(new Set());
  const primed = useRef(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const p = await Notification.requestPermission();
    setPermission(p);
  }, []);

  const fireBrowserNotification = useCallback((n: AdminNotification) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    try {
      const notif = new Notification(n.title, {
        body: n.body || undefined,
        tag: n.id, // dedupes if the same one is fired twice
        icon: "/favicon.ico",
      });
      notif.onclick = () => {
        window.focus();
        if (n.link) window.location.href = n.link;
        notif.close();
      };
    } catch {
      // some browsers throw if constructed without an active document
    }
  }, []);

  const poll = useCallback(async () => {
    try {
      const res = await apiClient.get("/notifications", { params: { limit: 30 } });
      const list: AdminNotification[] = Array.isArray(res.data) ? res.data : [];
      setItems(list);
      setUnread(list.filter((n) => !n.read).length);

      if (!primed.current) {
        // First load — remember the existing backlog WITHOUT alerting for it.
        list.forEach((n) => seen.current.add(n.id));
        primed.current = true;
      } else {
        // Alert (desktop) for genuinely new, unread arrivals.
        for (const n of list) {
          if (!seen.current.has(n.id)) {
            seen.current.add(n.id);
            if (!n.read) fireBrowserNotification(n);
          }
        }
      }
    } catch {
      // ignore transient failures
    }
  }, [fireBrowserNotification]);

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

  return { items, unread, refreshList: poll, markAllRead, markRead, permission, requestPermission };
}
