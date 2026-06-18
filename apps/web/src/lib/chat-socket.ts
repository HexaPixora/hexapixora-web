import { io, Socket } from "socket.io-client";

/**
 * Origin of the realtime (socket.io) server. The REST base URL ends in "/api";
 * the websocket server lives at the bare origin, namespace "/chat".
 */
export function socketOrigin(): string {
  // Explicit websocket origin wins. Needed in production when the browser talks
  // to the web app over a same-origin /api proxy (NEXT_PUBLIC_API_URL=/api):
  // websockets can't traverse that HTTP proxy, so point this at the API's public
  // origin, e.g. https://hexapixora-api.onrender.com.
  if (process.env.NEXT_PUBLIC_WS_ORIGIN) {
    return process.env.NEXT_PUBLIC_WS_ORIGIN.replace(/\/+$/, "");
  }
  // An absolute API base (not the relative "/api") also tells us the origin.
  if (process.env.NEXT_PUBLIC_API_URL && /^https?:\/\//.test(process.env.NEXT_PUBLIC_API_URL)) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "");
  }
  // Otherwise connect to the API on the SAME host the page was loaded from, on
  // port 3001 — so it works over localhost and from a phone on the LAN. (Unlike
  // REST, the websocket can't go through Next's /api proxy, so it must target
  // the API origin directly; the API's dev CORS allows LAN origins.)
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:3001`;
  }
  return "http://localhost:3001";
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
