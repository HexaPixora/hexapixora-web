import { io, Socket } from "socket.io-client";

/**
 * Origin of the realtime (socket.io) server. The REST base URL ends in "/api";
 * the websocket server lives at the bare origin, namespace "/chat".
 */
export function socketOrigin(): string {
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  return apiBase.replace(/\/api\/?$/, "");
}

export interface ChatSocketAuth {
  // Visitor handshake — agents authenticate via the access_token cookie instead.
  conversationId?: string;
  visitorToken?: string;
}

export function createChatSocket(auth: ChatSocketAuth = {}): Socket {
  return io(`${socketOrigin()}/chat`, {
    auth,
    withCredentials: true,
    transports: ["websocket", "polling"],
    autoConnect: true,
  });
}
