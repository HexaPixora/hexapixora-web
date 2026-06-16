"use client";

import { useEffect, useRef, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { createChatSocket } from "@/lib/chat-socket";

/**
 * Live count of conversations needing attention (waiting for an agent or with
 * an unread visitor message). Seeds from the API, then keeps fresh over the
 * chat socket. Pass enabled=false for users without chat access (avoids 403s).
 */
export function useChatUnread(enabled: boolean): number {
  const [count, setCount] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) {
      setCount(0);
      return;
    }

    let alive = true;
    const refresh = () => {
      apiClient
        .get("/chat/admin/unread-count")
        .then((res) => alive && setCount(res.data?.count ?? 0))
        .catch(() => {});
    };
    // Debounce bursts of socket events into a single refetch.
    const schedule = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(refresh, 400);
    };

    refresh();
    const socket = createChatSocket();
    socket.on("conversation:new", schedule);
    socket.on("conversation:updated", schedule);
    socket.on("conversation:deleted", schedule);

    return () => {
      alive = false;
      if (timer.current) clearTimeout(timer.current);
      socket.disconnect();
    };
  }, [enabled]);

  return count;
}
