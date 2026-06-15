"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import type { Socket } from "socket.io-client";
import { apiClient } from "@/lib/api-client";
import { createChatSocket } from "@/lib/chat-socket";
import { cn } from "@/lib/utils";
import {
  MessageCircle, MessageSquare, Bot, X, Send, Headset, Sparkles, User, Mail, Loader2,
} from "lucide-react";

type Role = "USER" | "AI" | "AGENT" | "SYSTEM";
interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  createdAt?: string;
}
interface PublicConfig {
  enabled: boolean;
  botName: string;
  welcomeMessage: string;
  accentColor: string;
  position?: "bottom-right" | "bottom-left";
  launcherIcon?: string;
  headerSubtitle?: string;
  showAgentHandoff?: boolean;
  teamName?: string;
  quickReplies?: { label: string }[];
}

const LAUNCHER_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  "message-circle": MessageCircle,
  "message-square": MessageSquare,
  bot: Bot,
  sparkles: Sparkles,
  headset: Headset,
};

const CONV_KEY = "hp_chat_conversation_id";
const TOKEN_KEY = "hp_chat_visitor_token";

export default function ChatWidget() {
  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"loading" | "form" | "chat">("loading");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [botTyping, setBotTyping] = useState(false);
  const [requestedAgent, setRequestedAgent] = useState(false);
  // Once the visitor types their own message, the starter chips are hidden.
  const [typedCustom, setTypedCustom] = useState(false);

  // Pre-chat form state.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const convId = useRef<string | null>(null);
  const token = useRef<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const initedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Merge messages by id so REST responses and socket events never duplicate.
  const addMessages = useCallback((incoming: ChatMessage[]) => {
    setMessages((prev) => {
      const byId = new Map(prev.map((m) => [m.id, m]));
      for (const m of incoming) byId.set(m.id, m);
      return Array.from(byId.values()).sort((a, b) =>
        (a.createdAt || "").localeCompare(b.createdAt || ""),
      );
    });
  }, []);

  useEffect(() => {
    apiClient
      .get("/chat/config")
      .then((res) => setConfig(res.data))
      .catch(() => setConfig(null));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, botTyping, open, view]);

  const connectSocket = useCallback(() => {
    if (socketRef.current || !convId.current || !token.current) return;
    const socket = createChatSocket({
      conversationId: convId.current,
      visitorToken: token.current,
    });
    socket.on("message", (msg: ChatMessage) => {
      addMessages([msg]);
      if (msg.role === "AI" || msg.role === "AGENT") setBotTyping(false);
    });
    socketRef.current = socket;
  }, [addMessages]);

  // On first open: restore an existing conversation, or show the pre-chat form.
  const init = useCallback(async () => {
    if (initedRef.current) return;
    initedRef.current = true;

    const storedId = typeof window !== "undefined" ? localStorage.getItem(CONV_KEY) : null;
    const storedToken = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

    if (storedId && storedToken) {
      convId.current = storedId;
      token.current = storedToken;
      try {
        const res = await apiClient.get(`/chat/${storedId}/messages`, {
          headers: { "x-visitor-token": storedToken },
        });
        addMessages(res.data.messages || []);
        connectSocket();
        setView("chat");
        return;
      } catch {
        // Stored conversation is gone — fall through to the form.
        localStorage.removeItem(CONV_KEY);
        localStorage.removeItem(TOKEN_KEY);
        convId.current = null;
        token.current = null;
      }
    }
    setView("form");
  }, [addMessages, connectSocket]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) void init();
  };

  const startWithInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    const em = email.trim();
    if (n.length < 2) {
      setFormError("Please enter your name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    setFormError(null);
    setStarting(true);
    try {
      const res = await apiClient.post("/chat/start", { visitorName: n, visitorEmail: em });
      convId.current = res.data.conversationId;
      token.current = res.data.visitorToken;
      localStorage.setItem(CONV_KEY, res.data.conversationId);
      localStorage.setItem(TOKEN_KEY, res.data.visitorToken);
      addMessages(res.data.messages || []);
      connectSocket();
      setView("chat");
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setStarting(false);
    }
  };

  const send = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || sending || !convId.current || !token.current) return;
    if (!override) {
      setInput("");
      setTypedCustom(true); // a typed message hides the starter chips
    }
    setSending(true);
    setBotTyping(true);
    try {
      const res = await apiClient.post(
        `/chat/${convId.current}/messages`,
        { content: text },
        { headers: { "x-visitor-token": token.current } },
      );
      addMessages(res.data.messages || []);
    } catch {
      addMessages([
        { id: `err-${Date.now()}`, role: "SYSTEM", content: "Sorry, your message couldn't be sent. Please try again." },
      ]);
    } finally {
      setSending(false);
      setBotTyping(false);
    }
  };

  const requestAgent = async () => {
    if (!convId.current || !token.current || requestedAgent) return;
    setRequestedAgent(true);
    try {
      const res = await apiClient.post(
        `/chat/${convId.current}/request-agent`,
        {},
        { headers: { "x-visitor-token": token.current } },
      );
      addMessages(res.data.messages || []);
    } catch {
      setRequestedAgent(false);
    }
  };

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  if (!config || !config.enabled) return null;
  const accent = config.accentColor || "#4f46e5";
  const leftSide = config.position === "bottom-left";
  const LauncherIcon = LAUNCHER_ICONS[config.launcherIcon || "message-circle"] || MessageCircle;
  // Once a human replies, the widget presents the support team instead of the bot.
  const hasAgent = messages.some((m) => m.role === "AGENT");

  return (
    <div
      className={cn(
        "fixed bottom-5 z-[60] flex flex-col",
        leftSide ? "left-5 items-start" : "right-5 items-end",
      )}
    >
      {open && (
        <div className="mb-3 flex h-[32rem] max-h-[75vh] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-muted/40 bg-background shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 text-white" style={{ background: accent }}>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                {hasAgent ? <Headset size={16} /> : <LauncherIcon size={16} />}
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold">
                  {hasAgent ? config.teamName || "Support Team" : config.botName}
                </p>
                <p className="text-[11px] text-white/80">
                  {hasAgent ? "A team member is here to help" : config.headerSubtitle || "Typically replies instantly"}
                </p>
              </div>
            </div>
            <button onClick={toggle} aria-label="Close chat" className="rounded-md p-1 hover:bg-white/20">
              <X size={18} />
            </button>
          </div>

          {/* Loading */}
          {view === "loading" && (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              <Loader2 className="animate-spin" size={20} />
            </div>
          )}

          {/* Pre-chat form */}
          {view === "form" && (
            <div className="flex flex-1 flex-col justify-center px-5 py-6">
              <div className="mb-5 text-center">
                <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: `${accent}1a`, color: accent }}>
                  <MessageCircle size={22} />
                </span>
                <h3 className="text-base font-semibold">Let&apos;s get started</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tell us who you are so our team can follow up if needed.
                </p>
              </div>

              <form onSubmit={startWithInfo} className="space-y-3">
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    className="w-full rounded-lg border border-muted/50 bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full rounded-lg border border-muted/50 bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
                  />
                </div>

                {formError && <p className="text-xs text-destructive">{formError}</p>}

                <button
                  type="submit"
                  disabled={starting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-60"
                  style={{ background: accent }}
                >
                  {starting ? <Loader2 className="animate-spin" size={16} /> : <Send size={15} />}
                  Start chat
                </button>
                <p className="text-center text-[10px] text-muted-foreground">
                  By starting a chat you agree to be contacted about your enquiry.
                </p>
              </form>
            </div>
          )}

          {/* Chat */}
          {view === "chat" && (
            <>
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-muted/10 px-3 py-4">
                {messages.map((m) =>
                  m.role === "SYSTEM" ? (
                    <p key={m.id} className="mx-auto max-w-[90%] text-center text-[11px] text-muted-foreground">
                      {m.content}
                    </p>
                  ) : (
                    <div key={m.id} className={cn("flex", m.role === "USER" ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm",
                          m.role === "USER" ? "rounded-br-sm text-white" : "rounded-bl-sm border border-muted/40 bg-background text-foreground",
                        )}
                        style={m.role === "USER" ? { background: accent } : undefined}
                      >
                        {m.role === "AGENT" && (
                          <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide opacity-70">Team</span>
                        )}
                        {m.content}
                      </div>
                    </div>
                  ),
                )}
                {botTyping && (
                  <div className="flex justify-start">
                    <div className="flex gap-1 rounded-2xl rounded-bl-sm border border-muted/40 bg-background px-3 py-2.5">
                      <Dot /> <Dot delay="150ms" /> <Dot delay="300ms" />
                    </div>
                  </div>
                )}
              </div>

              {/* Quick-reply chips — hidden after the visitor types their own
                  message or once a human agent joins. */}
              {(() => {
                const chips = (config.quickReplies || []).filter((q) => q.label.trim());
                if (!chips.length || typedCustom || hasAgent) return null;
                return (
                  <div className="flex flex-wrap gap-1.5 border-t border-muted/30 px-2.5 pb-1 pt-2.5">
                    {chips.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => void send(q.label)}
                        disabled={sending}
                        className="rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted/40 disabled:opacity-50"
                        style={{ borderColor: `${accent}55`, color: accent }}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                );
              })()}

              {config.showAgentHandoff !== false && !requestedAgent && !hasAgent && (
                <button
                  onClick={requestAgent}
                  className="flex items-center justify-center gap-1.5 border-t border-muted/30 py-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Headset size={13} /> Talk to a human
                </button>
              )}

              <div className="flex items-center gap-2 border-t border-muted/30 p-2.5">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                  placeholder="Type your message…"
                  className="flex-1 rounded-full border border-muted/50 bg-background px-4 py-2 text-sm outline-none focus:border-primary"
                />
                <button
                  onClick={() => void send()}
                  disabled={sending || !input.trim()}
                  aria-label="Send"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white disabled:opacity-50"
                  style={{ background: accent }}
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Launcher button */}
      <button
        onClick={toggle}
        aria-label={open ? "Close chat" : "Open chat"}
        className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-transform hover:scale-105"
        style={{ background: accent }}
      >
        {open ? <X size={24} /> : <LauncherIcon size={24} />}
      </button>
    </div>
  );
}

function Dot({ delay = "0ms" }: { delay?: string }) {
  return (
    <span
      className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60"
      style={{ animationDelay: delay }}
    />
  );
}
