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

/**
 * Admin notification feed. Polls the unread count on an interval (there's no
 * socket for these), and loads the list on demand when the bell is opened.
 * Pass enabled=false while the session is still loading to avoid 401s.
 */
export function useNotifications(enabled: boolean) {
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshCount = useCallback(() => {
    apiClient
      .get("/notifications/unread-count")
      .then((r) => setUnread(r.data?.count ?? 0))
      .catch(() => {});
  }, []);

  const refreshList = useCallback(() => {
    apiClient
      .get("/notifications", { params: { limit: 20 } })
      .then((r) => setItems(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!enabled) return;
    refreshCount();
    timer.current = setInterval(refreshCount, 30_000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [enabled, refreshCount]);

  const markAllRead = useCallback(async () => {
    setItems((list) => list.map((n) => ({ ...n, read: true })));
    setUnread(0);
    await apiClient.post("/notifications/read-all").catch(() => {});
  }, []);

  const markRead = useCallback(async (id: string) => {
    setItems((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnread((c) => Math.max(0, c - 1));
    await apiClient.post(`/notifications/${id}/read`).catch(() => {});
  }, []);

  return { items, unread, refreshList, refreshCount, markAllRead, markRead };
}
