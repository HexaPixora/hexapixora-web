"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import type { Socket } from "socket.io-client";
import { apiClient } from "@/lib/api-client";
import { createChatSocket } from "@/lib/chat-socket";
import { cn } from "@/lib/utils";
import { X, Send, Headset, User, Mail, Loader2 } from "lucide-react";
import chatSupportIcon from "@/components/icons/chatsupport-icon.svg";

type Role = "USER" | "AI" | "AGENT" | "SYSTEM";
interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  createdAt?: string;
}
interface Chip {
  label: string;
  children?: Chip[];
}
interface PublicConfig {
  enabled: boolean;
  botName: string;
  welcomeMessage: string;
  position?: "bottom-right" | "bottom-left";
  // Optional custom image to replace the default chatbot icon.
  launcherIconUrl?: string | null;
  headerSubtitle?: string;
  showAgentHandoff?: boolean;
  teamName?: string;
  teamSubtitle?: string;
  quickReplies?: Chip[];
}

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
  // Drill-down path through nested chip menus (each entry is the tapped parent).
  const [chipTrail, setChipTrail] = useState<Chip[]>([]);
  // Live conversation status — drives chip visibility / human-handoff state.
  const [status, setStatus] = useState<"BOT" | "WAITING_AGENT" | "AGENT" | "CLOSED">("BOT");

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
    socket.on("conversation:status", (p: { status: typeof status }) => {
      setStatus(p.status);
      // Closing the chat resets it to a fresh, selectable chip menu.
      if (p.status === "CLOSED") {
        setChipTrail([]);
        setTypedCustom(false);
        setRequestedAgent(false);
      }
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
        if (res.data.status) setStatus(res.data.status);
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
      if (res.data.status) setStatus(res.data.status);
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
  const leftSide = config.position === "bottom-left";
  // Default icon is the brand chatbot glyph; a custom image can replace it.
  const iconSrc = config.launcherIconUrl || chatSupportIcon.src;
  // While a human is handling the chat, present the support team instead of the bot.
  const hasAgent = status === "AGENT";

  return (
    <div className={cn("fixed bottom-5 z-[60]", leftSide ? "left-5" : "right-5")}>
      {/* Panel — always mounted & absolutely positioned so it animates open/close
          smoothly without reserving layout space (which would shove the launcher up). */}
      <div
        aria-hidden={!open}
        className={cn(
          "absolute bottom-[4.5rem] flex h-[32rem] max-h-[75vh] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-white/15 bg-white/[0.07] shadow-2xl ring-1 ring-inset ring-white/10 backdrop-blur-2xl transition-all duration-300 ease-out",
          leftSide ? "left-0 origin-bottom-left" : "right-0 origin-bottom-right",
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-95 opacity-0",
        )}
      >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.05] px-4 py-3 text-foreground">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/10">
                {hasAgent ? (
                  <Headset size={16} />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={iconSrc} alt="" className="h-5 w-5 object-contain" />
                )}
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold">
                  {hasAgent ? config.teamName || "Support Team" : config.botName}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {hasAgent
                    ? config.teamSubtitle || "A team member is here to help"
                    : config.headerSubtitle || "Typically replies instantly"}
                </p>
              </div>
            </div>
            <button onClick={toggle} aria-label="Close chat" className="rounded-md p-1 text-foreground transition-colors hover:bg-white/10">
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
                <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={iconSrc} alt="" className="h-7 w-7 object-contain" />
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
                    className="w-full rounded-lg border border-white/15 bg-white/5 py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-white/30"
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
                    className="w-full rounded-lg border border-white/15 bg-white/5 py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-white/30"
                  />
                </div>

                {formError && <p className="text-xs text-destructive">{formError}</p>}

                <button
                  type="submit"
                  disabled={starting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/15 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-white/25 disabled:opacity-60"
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
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
                {messages.map((m) =>
                  m.role === "SYSTEM" ? (
                    <p key={m.id} className="mx-auto max-w-[90%] animate-[chatPopIn_0.28s_ease-out] text-center text-[11px] text-muted-foreground">
                      {m.content}
                    </p>
                  ) : (
                    <div key={m.id} className={cn("flex animate-[chatPopIn_0.28s_ease-out]", m.role === "USER" ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm text-foreground",
                          m.role === "USER"
                            ? "rounded-br-sm bg-white/15"
                            : "rounded-bl-sm border border-white/10 bg-white/[0.06]",
                        )}
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
                  <div className="flex animate-[chatPopIn_0.28s_ease-out] justify-start">
                    <div className="flex gap-1 rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.06] px-3 py-2.5">
                      <Dot /> <Dot delay="150ms" /> <Dot delay="300ms" />
                    </div>
                  </div>
                )}

                {/* Quick-reply chips — inline in the conversation. Hidden while a
                    human is being requested/handling; shown again once closed. */}
                {(() => {
                  const top = (config.quickReplies || []).filter((q) => q.label.trim());
                  const closed = status === "CLOSED";
                  const handing = requestedAgent || status === "WAITING_AGENT" || status === "AGENT";
                  if (!top.length || botTyping || (!closed && (typedCustom || handing))) return null;
                  const parent = chipTrail[chipTrail.length - 1];
                  const level = (parent ? parent.children || [] : top).filter((q) => q.label.trim());
                  const onChip = (c: Chip) => {
                    if (c.children && c.children.length) {
                      setChipTrail((t) => [...t, c]);
                    } else {
                      void send(c.label);
                      setChipTrail([]);
                    }
                  };
                  return (
                    <div className="flex animate-[chatPopIn_0.28s_ease-out] flex-wrap gap-1.5 pt-0.5">
                      {chipTrail.length > 0 && (
                        <button
                          onClick={() => setChipTrail((t) => t.slice(0, -1))}
                          className="rounded-full border border-white/15 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/10"
                        >
                          ← Back
                        </button>
                      )}
                      {level.map((c, i) => (
                        <button
                          key={i}
                          onClick={() => onChip(c)}
                          disabled={sending}
                          className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-white/10 disabled:opacity-50"
                        >
                          {c.label}
                          {c.children && c.children.length ? " ›" : ""}
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {config.showAgentHandoff !== false && !requestedAgent && status === "BOT" && (
                <button
                  onClick={requestAgent}
                  className="flex items-center justify-center gap-1.5 border-t border-white/10 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Headset size={13} /> Talk to a human
                </button>
              )}

              <div className="flex items-center gap-2 border-t border-white/10 p-2.5">
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
                  className="flex-1 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm outline-none transition-colors focus:border-white/30"
                />
                <button
                  onClick={() => void send()}
                  disabled={sending || !input.trim()}
                  aria-label="Send"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/15 text-foreground transition-colors hover:bg-white/25 disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>

      {/* Launcher button — glass, showing the chatbot icon (or a custom image). */}
      <button
        onClick={toggle}
        aria-label={open ? "Close chat" : "Open chat"}
        className="group flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-white/20 p-2.5 text-foreground shadow-xl shadow-black/40 ring-1 ring-inset ring-white/15 backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-110 hover:bg-white/30 hover:ring-white/30 active:scale-95"
      >
        {open ? (
          <X size={24} className="transition-transform duration-300" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={iconSrc} alt="" className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110" />
        )}
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
