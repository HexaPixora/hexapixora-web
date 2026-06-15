"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import type { Socket } from "socket.io-client";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { createChatSocket } from "@/lib/chat-socket";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Send, Bot, User as UserIcon, Headset, CheckCircle2, RotateCcw,
  Settings as Cog, Mail, Search, MessageCircle, ExternalLink, Inbox, Wifi, WifiOff,
} from "lucide-react";

type Status = "BOT" | "WAITING_AGENT" | "AGENT" | "CLOSED";
type Role = "USER" | "AI" | "AGENT" | "SYSTEM";

interface Summary {
  id: string;
  status: Status;
  visitorName: string | null;
  visitorEmail: string | null;
  assignedTo: { id: string; name: string | null } | null;
  leadId: string | null;
  unreadForAgent: boolean;
  lastMessageAt: string;
  lastMessage: { role: Role; content: string } | null;
}
interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt?: string;
}

const STATUS_META: Record<Status, { label: string; cls: string; dot: string }> = {
  BOT: { label: "AI", cls: "bg-blue-500/15 text-blue-400 border-blue-500/20", dot: "bg-blue-400" },
  WAITING_AGENT: { label: "Needs agent", cls: "bg-amber-500/15 text-amber-400 border-amber-500/20", dot: "bg-amber-400" },
  AGENT: { label: "With agent", cls: "bg-green-500/15 text-green-400 border-green-500/20", dot: "bg-green-400" },
  CLOSED: { label: "Closed", cls: "bg-muted text-muted-foreground border-muted", dot: "bg-muted-foreground" },
};

const FILTERS: { key: "all" | Status; label: string }[] = [
  { key: "all", label: "All" },
  { key: "WAITING_AGENT", label: "Needs agent" },
  { key: "AGENT", label: "With agent" },
  { key: "BOT", label: "AI" },
  { key: "CLOSED", label: "Closed" },
];

function timeAgo(iso?: string): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function initials(name?: string | null, email?: string | null): string {
  const base = (name || email || "?").trim();
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  return base.slice(0, 2).toUpperCase();
}

export default function ChatInbox() {
  const [conversations, setConversations] = useState<Summary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [active, setActive] = useState<any>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [search, setSearch] = useState("");
  const [connected, setConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const upsertSummary = useCallback((s: Summary | null) => {
    if (!s) return;
    setConversations((prev) => {
      const rest = prev.filter((c) => c.id !== s.id);
      return [s, ...rest].sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
    });
  }, []);

  useEffect(() => {
    apiClient
      .get("/chat/admin/conversations")
      .then((res) => setConversations(res.data || []))
      .catch(() => toast.error("Failed to load conversations"));

    const socket = createChatSocket();
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("conversation:new", (s: Summary) => {
      upsertSummary(s);
      toast.message("New conversation started");
    });
    socket.on("conversation:updated", (s: Summary) => upsertSummary(s));
    socket.on("message", (m: Message) => {
      if (activeIdRef.current) {
        setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
      }
    });
    socketRef.current = socket;
    return () => { socket.disconnect(); };
  }, [upsertSummary]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: conversations.length };
    for (const conv of conversations) c[conv.status] = (c[conv.status] || 0) + 1;
    return c;
  }, [conversations]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations.filter((c) => {
      if (filter !== "all" && c.status !== filter) return false;
      if (!q) return true;
      return `${c.visitorName || ""} ${c.visitorEmail || ""} ${c.lastMessage?.content || ""}`
        .toLowerCase()
        .includes(q);
    });
  }, [conversations, filter, search]);

  const openConversation = async (id: string) => {
    if (activeIdRef.current && socketRef.current) {
      socketRef.current.emit("leaveConversation", { conversationId: activeIdRef.current });
    }
    activeIdRef.current = id;
    setActiveId(id);
    socketRef.current?.emit("joinConversation", { conversationId: id });
    try {
      const res = await apiClient.get(`/chat/admin/conversations/${id}`);
      setActive(res.data);
      setMessages(res.data.messages || []);
      setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unreadForAgent: false } : c)));
    } catch {
      toast.error("Failed to open conversation");
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || sending || !activeId) return;
    setInput("");
    setSending(true);
    try {
      const res = await apiClient.post(`/chat/admin/conversations/${activeId}/messages`, { content: text });
      setMessages((prev) => (prev.some((x) => x.id === res.data.id) ? prev : [...prev, res.data]));
      setActive((a: any) => (a ? { ...a, status: "AGENT" } : a));
    } catch {
      toast.error("Couldn't send reply");
    } finally {
      setSending(false);
    }
  };

  const act = async (action: "takeover" | "release" | "close") => {
    if (!activeId) return;
    try {
      const res = await apiClient.patch(`/chat/admin/conversations/${activeId}`, { action });
      setActive(res.data);
      setMessages(res.data.messages || []);
      upsertSummary({
        id: res.data.id,
        status: res.data.status,
        visitorName: res.data.visitorName,
        visitorEmail: res.data.visitorEmail,
        assignedTo: res.data.assignedTo,
        leadId: res.data.leadId,
        unreadForAgent: false,
        lastMessageAt: res.data.lastMessageAt,
        lastMessage: null,
      });
      toast.success(action === "close" ? "Conversation closed" : action === "release" ? "Handed back to AI" : "You're now handling this chat");
    } catch {
      toast.error("Action failed");
    }
  };

  return (
    <div className="flex h-[calc(100vh-9rem)] gap-4">
      {/* ---- List ---- */}
      <div className="flex w-80 flex-shrink-0 flex-col overflow-hidden rounded-xl border bg-background">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">Inbox</h2>
            <span
              className={cn("inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium", connected ? "bg-green-500/15 text-green-400" : "bg-muted text-muted-foreground")}
              title={connected ? "Live — receiving updates" : "Reconnecting…"}
            >
              {connected ? <Wifi size={10} /> : <WifiOff size={10} />}
              {connected ? "Live" : "Off"}
            </span>
          </div>
          <Link href="/admin/chat/settings" className="text-muted-foreground transition-colors hover:text-foreground" title="Chatbot settings">
            <Cog size={16} />
          </Link>
        </div>

        {/* Search */}
        <div className="border-b p-2.5">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full rounded-lg border bg-background py-1.5 pl-8 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-1.5 border-b p-2.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                filter === f.key ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground hover:bg-muted",
              )}
            >
              {f.label}
              {counts[f.key] ? <span className="opacity-70">{counts[f.key]}</span> : null}
            </button>
          ))}
        </div>

        {/* List items */}
        <div className="flex-1 overflow-y-auto">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-16 text-center text-muted-foreground">
              <Inbox size={28} className="opacity-40" />
              <p className="text-sm">{conversations.length === 0 ? "No conversations yet." : "Nothing matches your filter."}</p>
            </div>
          ) : (
            visible.map((c) => {
              const meta = STATUS_META[c.status];
              const activeRow = activeId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => openConversation(c.id)}
                  className={cn("flex w-full gap-3 border-b px-3 py-3 text-left transition-colors hover:bg-muted/40", activeRow && "bg-muted/60")}
                >
                  <div className="relative flex-shrink-0">
                    <span className={cn("flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold", c.leadId ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
                      {initials(c.visitorName, c.visitorEmail)}
                    </span>
                    <span className={cn("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background", meta.dot)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{c.visitorName || c.visitorEmail || "Anonymous visitor"}</span>
                      <span className="flex-shrink-0 text-[10px] text-muted-foreground">{timeAgo(c.lastMessageAt)}</span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.lastMessage?.role === "USER" ? "" : c.lastMessage?.role === "AI" ? "AI: " : c.lastMessage?.role === "AGENT" ? "You: " : ""}
                      {c.lastMessage?.content || "—"}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className={cn("rounded-full border px-1.5 py-0.5 text-[10px] font-medium", meta.cls)}>{meta.label}</span>
                      {c.leadId && <span className="rounded-full border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">Lead</span>}
                      {c.unreadForAgent && <span className="ml-auto h-2 w-2 rounded-full bg-primary" />}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ---- Thread ---- */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border bg-background">
        {!active ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50">
              <MessageCircle size={26} className="opacity-50" />
            </span>
            <p className="text-sm">Select a conversation to view messages.</p>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold", active.leadId ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
                  {initials(active.visitorName, active.visitorEmail)}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">{active.visitorName || active.visitorEmail || "Anonymous visitor"}</p>
                    <span className={cn("rounded-full border px-1.5 py-0.5 text-[10px] font-medium", STATUS_META[active.status as Status].cls)}>
                      {STATUS_META[active.status as Status].label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {active.visitorEmail && (
                      <a href={`mailto:${active.visitorEmail}`} className="flex items-center gap-1 hover:text-foreground">
                        <Mail size={11} /> {active.visitorEmail}
                      </a>
                    )}
                    {active.leadId && (
                      <Link href="/admin/leads" className="flex items-center gap-1 text-primary hover:underline">
                        <ExternalLink size={11} /> View lead
                      </Link>
                    )}
                    {active.assignedTo?.name && <span>· {active.assignedTo.name}</span>}
                  </div>
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                {active.status !== "AGENT" && active.status !== "CLOSED" && (
                  <ActionBtn onClick={() => act("takeover")} icon={<Headset size={13} />} label="Take over" primary />
                )}
                {active.status === "AGENT" && (
                  <ActionBtn onClick={() => act("release")} icon={<RotateCcw size={13} />} label="Back to AI" />
                )}
                {active.status !== "CLOSED" && (
                  <ActionBtn onClick={() => act("close")} icon={<CheckCircle2 size={13} />} label="Close" />
                )}
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-muted/10 px-4 py-5">
              {messages.map((m) =>
                m.role === "SYSTEM" ? (
                  <div key={m.id} className="flex justify-center">
                    <span className="rounded-full bg-muted/60 px-3 py-1 text-[11px] text-muted-foreground">{m.content}</span>
                  </div>
                ) : (
                  <MessageRow key={m.id} m={m} />
                ),
              )}
            </div>

            {/* Composer */}
            {active.status !== "CLOSED" ? (
              <div className="border-t p-3">
                {active.status !== "AGENT" && (
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] text-amber-500">
                    <Headset size={12} /> Replying will take this chat over from the AI.
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); }
                    }}
                    placeholder="Type your reply…"
                    className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => void send()}
                    disabled={sending || !input.trim()}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity disabled:opacity-50"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <p className="border-t px-4 py-3 text-center text-xs text-muted-foreground">This conversation is closed.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function MessageRow({ m }: { m: Message }) {
  const fromVisitor = m.role === "USER";
  return (
    <div className={cn("flex items-end gap-2", fromVisitor ? "justify-start" : "justify-end")}>
      {fromVisitor && <Avatar role={m.role} />}
      <div className={cn("max-w-[72%]")}>
        <div
          className={cn(
            "whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm",
            fromVisitor
              ? "rounded-bl-sm border bg-background"
              : m.role === "AI"
                ? "rounded-br-sm bg-blue-500/10 text-foreground"
                : "rounded-br-sm bg-primary text-primary-foreground",
          )}
        >
          {m.content}
        </div>
        <p className={cn("mt-0.5 px-1 text-[10px] text-muted-foreground", fromVisitor ? "text-left" : "text-right")}>
          {m.role === "USER" ? "Visitor" : m.role === "AI" ? "AI" : "You"}
          {m.createdAt ? ` · ${timeAgo(m.createdAt)}` : ""}
        </p>
      </div>
      {!fromVisitor && <Avatar role={m.role} />}
    </div>
  );
}

function Avatar({ role }: { role: Role }) {
  const map = {
    USER: { cls: "bg-muted text-muted-foreground", icon: <UserIcon size={13} /> },
    AI: { cls: "bg-blue-500/15 text-blue-400", icon: <Bot size={13} /> },
    AGENT: { cls: "bg-primary/15 text-primary", icon: <Headset size={13} /> },
    SYSTEM: { cls: "bg-muted text-muted-foreground", icon: <Bot size={13} /> },
  }[role];
  return <span className={cn("flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full", map.cls)}>{map.icon}</span>;
}

function ActionBtn({
  onClick, icon, label, primary,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
        primary ? "bg-primary text-primary-foreground hover:opacity-90" : "border bg-background hover:bg-muted",
      )}
    >
      {icon} {label}
    </button>
  );
}
