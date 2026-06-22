/**
 * Single source of truth for status pill colors across the admin. Uses the same
 * tint convention as content StatusBadge (`/15` background + `text-…-600
 * dark:text-…-400`) so leads, chat, and content statuses look like one system
 * instead of the previous ad-hoc `/20 text-…-400` variations.
 *
 * Class strings are written as full literals (not built dynamically) so
 * Tailwind's content scanner reliably generates them.
 */

export type StatusStyle = { label: string; cls: string; dot: string };

const BLUE: Omit<StatusStyle, "label"> = { cls: "bg-blue-500/15 text-blue-600 dark:text-blue-400", dot: "bg-blue-500" };
const AMBER: Omit<StatusStyle, "label"> = { cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400", dot: "bg-amber-500" };
const EMERALD: Omit<StatusStyle, "label"> = { cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" };
const NEUTRAL: Omit<StatusStyle, "label"> = { cls: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" };

export const LEAD_STATUS: Record<string, StatusStyle> = {
  NEW: { label: "New", ...BLUE },
  CONTACTED: { label: "Contacted", ...AMBER },
  QUALIFIED: { label: "Qualified", ...EMERALD },
  CLOSED: { label: "Closed", ...NEUTRAL },
};

export const CHAT_STATUS: Record<string, StatusStyle> = {
  BOT: { label: "AI", ...BLUE },
  WAITING_AGENT: { label: "Needs agent", ...AMBER },
  AGENT: { label: "With agent", ...EMERALD },
  CLOSED: { label: "Closed", ...NEUTRAL },
};
