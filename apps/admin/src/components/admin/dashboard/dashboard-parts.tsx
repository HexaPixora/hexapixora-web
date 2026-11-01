import type { ReactNode } from "react";
import { cn } from "@hexapixora/ui/cn";

/** Small uppercase label in the theme's mono face. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground", className)}>
      {children}
    </p>
  );
}

/** A dashboard panel: title row (with an optional link) over its content. */
export function Panel({
  title,
  aside,
  link,
  children,
  className,
}: {
  title: string;
  aside?: ReactNode;
  link?: { href: string; label: string };
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border bg-card p-5", className)} aria-label={title}>
      <div className="mb-4 flex items-center gap-3">
        <h2 className="font-heading text-[15px] font-medium">{title}</h2>
        {aside}
        {link ? (
          <a
            href={link.href}
            className="ml-auto font-mono text-[11px] uppercase tracking-[0.08em] text-primary hover:underline"
          >
            {link.label} →
          </a>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/** One headline number with a label and a line of context. */
export function StatCard({ label, value, note }: { label: string; value: ReactNode; note?: ReactNode }) {
  return (
    <div className="border bg-card px-5 py-4">
      <Eyebrow>{label}</Eyebrow>
      <p className="my-2.5 font-heading text-[34px] font-medium leading-none tabular-nums">{value}</p>
      {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
    </div>
  );
}

const TONES = {
  accent: "text-primary",
  ok: "text-success",
  warn: "text-warning",
  dim: "text-muted-foreground",
} as const;

/** A status as a dot and a word, so it never relies on colour alone. */
export function StatusBadge({ tone, children }: { tone: keyof typeof TONES; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.04em]",
        TONES[tone],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}

/** A row in a panel list: title and detail on the left, something on the right. */
export function ListRow({ href, title, detail, end }: { href?: string; title: string; detail: ReactNode; end?: ReactNode }) {
  const body = (
    <>
      <span className="min-w-0">
        <span className="block truncate font-semibold">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">{detail}</span>
      </span>
      {end}
    </>
  );
  const cls = "flex items-center justify-between gap-3 border-t py-2.5 first:border-t-0";
  return href ? (
    <a href={href} className={cn(cls, "hover:text-primary")}>
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  );
}

const RELATIVE = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** "2 hours ago", "yesterday", "in 3 days". */
export function relativeTime(iso: string, now = Date.now()): string {
  const seconds = (new Date(iso).getTime() - now) / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return RELATIVE.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

/** "Wed 4 Nov, 09:00". */
export function shortDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
