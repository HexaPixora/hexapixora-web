"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Loader2, Save, Bot, MessageCircle, MessageSquare, Sparkles, Send, X, Headset,
  Palette, ShieldCheck, Zap, Power, MessageSquarePlus, Plus, Trash2, GripVertical,
} from "lucide-react";

const PREVIEW_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  "message-circle": MessageCircle,
  "message-square": MessageSquare,
  bot: Bot,
  sparkles: Sparkles,
  headset: Headset,
};

interface QuickReply {
  label: string;
  reply?: string;
}
interface Config {
  enabled: boolean;
  botName: string;
  welcomeMessage: string;
  systemPrompt: string | null;
  aiEnabled: boolean;
  aiModel: string;
  accentColor: string;
  offlineMessage: string;
  collectLeads: boolean;
  quickReplies: QuickReply[];
  position: string;
  launcherIcon: string;
  headerSubtitle: string;
  showAgentHandoff: boolean;
  teamName: string;
}

const ICON_OPTIONS = [
  { value: "message-circle", label: "Chat bubble" },
  { value: "message-square", label: "Message square" },
  { value: "bot", label: "Robot" },
  { value: "sparkles", label: "Sparkles" },
  { value: "headset", label: "Headset" },
];

const LABEL = "text-sm font-medium";
const INPUT =
  "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30";
const HINT = "text-xs text-muted-foreground";

export default function ChatbotSettingsForm() {
  const [config, setConfig] = useState<Config | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    apiClient
      .get("/chat/admin/config")
      .then((res) =>
        setConfig({
          ...res.data,
          quickReplies: Array.isArray(res.data?.quickReplies) ? res.data.quickReplies : [],
        }),
      )
      .catch(() => toast.error("Failed to load chatbot settings"));
  }, []);

  const set = <K extends keyof Config>(key: K, value: Config[K]) => {
    setConfig((c) => (c ? { ...c, [key]: value } : c));
    setDirty(true);
  };

  const chips = config?.quickReplies ?? [];
  const setChips = (next: QuickReply[]) => set("quickReplies", next);
  const addChip = () => setChips([...chips, { label: "", reply: "" }]);
  const updateChip = (i: number, field: keyof QuickReply, value: string) =>
    setChips(chips.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)));
  const removeChip = (i: number) => setChips(chips.filter((_, idx) => idx !== i));

  const save = async () => {
    if (!config) return;
    setSaving(true);
    try {
      // Drop chips with no label; trim everything so validation passes cleanly.
      const cleaned: Config = {
        ...config,
        quickReplies: chips
          .map((c) => ({ label: c.label.trim(), reply: c.reply?.trim() || undefined }))
          .filter((c) => c.label.length > 0),
      };
      await apiClient.put("/chat/admin/config", cleaned);
      setConfig(cleaned);
      setDirty(false);
      toast.success("Chatbot settings saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (!config) {
    return (
      <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="animate-spin" size={16} /> Loading settings…
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_22rem]">
      {/* ---- Left: settings ---- */}
      <div className="space-y-6">
        {/* Status strip */}
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill
            active={config.enabled}
            onLabel="Widget live"
            offLabel="Widget hidden"
            icon={<Power size={12} />}
          />
          <StatusPill
            active={config.aiEnabled}
            onLabel="AI replies on"
            offLabel="AI replies off"
            icon={<Zap size={12} />}
          />
          {config.collectLeads && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <ShieldCheck size={12} /> Lead capture
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <Bot size={12} /> {config.aiModel || "no model"}
          </span>
        </div>

        {/* Widget card */}
        <Card icon={<MessageCircle size={16} />} title="Widget" subtitle="How the chat bubble looks and greets visitors.">
          <Toggle
            label="Enable chat widget"
            description="Show the support chat bubble on the public website."
            checked={config.enabled}
            onChange={(v) => set("enabled", v)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Bot name">
              <input className={INPUT} value={config.botName} onChange={(e) => set("botName", e.target.value)} />
            </Field>
            <Field label="Header subtitle">
              <input className={INPUT} value={config.headerSubtitle} onChange={(e) => set("headerSubtitle", e.target.value)} placeholder="Typically replies instantly" />
            </Field>
          </div>
          <Field label="Welcome message" hint="The first thing visitors see when they open the chat.">
            <textarea className={INPUT} rows={2} value={config.welcomeMessage} onChange={(e) => set("welcomeMessage", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Position">
              <select className={INPUT} value={config.position} onChange={(e) => set("position", e.target.value)}>
                <option value="bottom-right">Bottom right</option>
                <option value="bottom-left">Bottom left</option>
              </select>
            </Field>
            <Field label="Launcher icon">
              <select className={INPUT} value={config.launcherIcon} onChange={(e) => set("launcherIcon", e.target.value)}>
                {ICON_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Accent color">
            <div className="flex items-center gap-2">
              <label className="relative h-9 w-9 cursor-pointer overflow-hidden rounded-lg border" style={{ background: config.accentColor }}>
                <input type="color" value={config.accentColor} onChange={(e) => set("accentColor", e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
              </label>
              <input className={cn(INPUT, "max-w-[9rem] font-mono")} value={config.accentColor} onChange={(e) => set("accentColor", e.target.value)} />
              <div className="flex items-center gap-1.5">
                {["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899"].map((c) => (
                  <button key={c} type="button" onClick={() => set("accentColor", c)} className="h-6 w-6 rounded-full border transition-transform hover:scale-110" style={{ background: c }} aria-label={`Use ${c}`} />
                ))}
              </div>
            </div>
          </Field>
        </Card>

        {/* AI card */}
        <Card icon={<Bot size={16} />} title="AI assistant" subtitle="The brain behind automatic replies.">
          <Toggle
            label="Enable AI replies"
            description="When on, the bot answers visitors automatically using your services. When off, chats go straight to your team."
            checked={config.aiEnabled}
            onChange={(v) => set("aiEnabled", v)}
          />
          <Toggle
            label="Collect leads"
            description="Let the AI ask for name & email and create a CRM lead from the conversation."
            checked={config.collectLeads}
            onChange={(v) => set("collectLeads", v)}
          />
          <Field
            label="AI model"
            hint={
              <>
                Model name on your configured endpoint. Default is <code className="rounded bg-muted px-1 py-0.5">llama-3.3-70b-versatile</code> (Groq&apos;s free tier); use <code className="rounded bg-muted px-1 py-0.5">llama-3.1-8b-instant</code> for faster replies, or a Gemini/Ollama model if you change the endpoint. The endpoint &amp; API key are set via server env vars.
              </>
            }
          >
            <input className={INPUT} value={config.aiModel} onChange={(e) => set("aiModel", e.target.value)} />
          </Field>
          <Field label="Extra instructions" hint="Optional. Appended to the services-scoped system prompt.">
            <textarea className={INPUT} rows={3} value={config.systemPrompt || ""} onChange={(e) => set("systemPrompt", e.target.value)} placeholder="e.g. Always mention our free 30-minute consultation." />
          </Field>
          <Field label="Offline / fallback message" hint="Shown when AI is off or unavailable, so the visitor knows the team will follow up.">
            <textarea className={INPUT} rows={2} value={config.offlineMessage} onChange={(e) => set("offlineMessage", e.target.value)} />
          </Field>
        </Card>

        {/* Human handoff card */}
        <Card icon={<Headset size={16} />} title="Human handoff" subtitle="What happens when a team member takes the chat over.">
          <Toggle
            label='Show "Talk to a human" button'
            description="Let visitors request a team member from inside the chat."
            checked={config.showAgentHandoff}
            onChange={(v) => set("showAgentHandoff", v)}
          />
          <Field label="Team display name" hint="Replaces the bot name in the chat header once a team member joins.">
            <input className={INPUT} value={config.teamName} onChange={(e) => set("teamName", e.target.value)} placeholder="Support Team" />
          </Field>
        </Card>

        {/* Quick replies card */}
        <Card
          icon={<MessageSquarePlus size={16} />}
          title="Quick reply chips"
          subtitle="Clickable suggestions shown in the chat. Leave the answer blank to let the AI respond, or fill it in for an instant canned reply."
        >
          <div className="space-y-3">
            {chips.length === 0 && (
              <p className="rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground">
                No quick replies yet. Add one to guide visitors.
              </p>
            )}
            {chips.map((chip, i) => (
              <div key={i} className="rounded-lg border bg-muted/20 p-3">
                <div className="flex items-center gap-2">
                  <GripVertical size={14} className="flex-shrink-0 text-muted-foreground/50" />
                  <input
                    className={cn(INPUT, "flex-1")}
                    value={chip.label}
                    onChange={(e) => updateChip(i, "label", e.target.value)}
                    placeholder="Chip label, e.g. What does it cost?"
                    maxLength={80}
                  />
                  <button
                    type="button"
                    onClick={() => removeChip(i)}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Remove chip"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <textarea
                  className={cn(INPUT, "mt-2")}
                  rows={2}
                  value={chip.reply || ""}
                  onChange={(e) => updateChip(i, "reply", e.target.value)}
                  placeholder="Instant answer (optional). Leave blank to let the AI answer."
                  maxLength={2000}
                />
                <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                  {chip.reply && chip.reply.trim() ? (
                    <><Zap size={11} className="text-amber-500" /> Answers instantly with the text above.</>
                  ) : (
                    <><Bot size={11} /> Sends to the AI for an answer.</>
                  )}
                </p>
              </div>
            ))}
            <button
              type="button"
              onClick={addChip}
              className="inline-flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Plus size={14} /> Add quick reply
            </button>
          </div>
        </Card>
      </div>

      {/* ---- Right: live preview + save ---- */}
      <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
        <div className="overflow-hidden rounded-2xl border bg-muted/20">
          <div className="flex items-center gap-2 border-b px-4 py-2.5 text-xs font-medium text-muted-foreground">
            <Palette size={13} /> Live preview
          </div>
          <div className="p-4">
            <WidgetPreview config={config} />
          </div>
        </div>

        <button
          onClick={save}
          disabled={saving || !dirty}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          {dirty ? "Save changes" : "Saved"}
        </button>
        {dirty && <p className="text-center text-xs text-muted-foreground">You have unsaved changes.</p>}
      </div>
    </div>
  );
}

/* ------------------------------- preview ---------------------------------- */

function WidgetPreview({ config }: { config: Config }) {
  const accent = config.accentColor || "#4f46e5";
  const Icon = PREVIEW_ICONS[config.launcherIcon] || MessageCircle;
  const leftSide = config.position === "bottom-left";
  return (
    <div className="mx-auto w-full max-w-[18rem]">
      <div className="overflow-hidden rounded-2xl border border-muted/40 bg-background shadow-lg">
        <div className="flex items-center justify-between px-3 py-2.5 text-white" style={{ background: accent }}>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
              <Icon size={13} />
            </span>
            <div className="leading-tight">
              <p className="text-xs font-semibold">{config.botName || "Support AI"}</p>
              <p className="text-[10px] text-white/80">{config.headerSubtitle || "Typically replies instantly"}</p>
            </div>
          </div>
          <X size={14} className="opacity-80" />
        </div>
        <div className="space-y-2 bg-muted/10 px-3 py-3" style={{ minHeight: "9rem" }}>
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-muted/40 bg-background px-3 py-2 text-xs">
              {config.welcomeMessage || "Hi! How can I help?"}
            </div>
          </div>
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl rounded-br-sm px-3 py-2 text-xs text-white" style={{ background: accent }}>
              Do you build online stores?
            </div>
          </div>
        </div>
        {config.quickReplies?.some((q) => q.label.trim()) && (
          <div className="flex flex-wrap gap-1.5 border-t border-muted/30 px-2.5 pb-1 pt-2">
            {config.quickReplies
              .filter((q) => q.label.trim())
              .slice(0, 4)
              .map((q, i) => (
                <span
                  key={i}
                  className="rounded-full border px-2.5 py-1 text-[10px] font-medium"
                  style={{ borderColor: `${accent}55`, color: accent }}
                >
                  {q.label}
                </span>
              ))}
          </div>
        )}
        <div className="flex items-center gap-2 border-t border-muted/30 p-2">
          <div className="flex-1 rounded-full border border-muted/50 px-3 py-1.5 text-[11px] text-muted-foreground">
            Type your message…
          </div>
          <span className="flex h-7 w-7 items-center justify-center rounded-full text-white" style={{ background: accent }}>
            <Send size={12} />
          </span>
        </div>
      </div>
      <div className={cn("mt-3 flex", leftSide ? "justify-start" : "justify-end")}>
        <span className="flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg" style={{ background: accent }}>
          <Icon size={20} />
        </span>
      </div>
    </div>
  );
}

/* ------------------------------- atoms ------------------------------------ */

function Card({
  icon, title, subtitle, children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-background">
      <div className="flex items-start gap-3 border-b px-5 py-4">
        <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</span>
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="space-y-5 p-5">{children}</div>
    </div>
  );
}

function Field({
  label, hint, children,
}: {
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className={LABEL}>{label}</label>
      {children}
      {hint && <p className={HINT}>{hint}</p>}
    </div>
  );
}

function StatusPill({
  active, onLabel, offLabel, icon,
}: {
  active: boolean;
  onLabel: string;
  offLabel: string;
  icon: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        active
          ? "border-green-500/20 bg-green-500/10 text-green-500"
          : "border-muted bg-muted/40 text-muted-foreground",
      )}
    >
      {icon} {active ? onLabel : offLabel}
    </span>
  );
}

function Toggle({
  label, description, checked, onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          checked ? "bg-primary" : "bg-muted",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </button>
    </div>
  );
}
