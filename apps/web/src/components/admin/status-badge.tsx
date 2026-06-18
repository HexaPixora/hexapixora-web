import type { ContentStatus } from "./status-control";

const STYLES: Record<ContentStatus, { label: string; cls: string }> = {
  DRAFT: {
    label: "Draft",
    cls: "bg-muted text-muted-foreground",
  },
  SCHEDULED: {
    label: "Scheduled",
    cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  PUBLISHED: {
    label: "Published",
    cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
};

/** Small pill showing a content item's publish status, with the scheduled time when relevant. */
export function StatusBadge({
  status,
  publishAt,
}: {
  status?: ContentStatus | null;
  publishAt?: string | null;
}) {
  const s = STYLES[status ?? "DRAFT"] ?? STYLES.DRAFT;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${s.cls}`}
      title={status === "SCHEDULED" && publishAt ? new Date(publishAt).toLocaleString() : undefined}
    >
      {s.label}
      {status === "SCHEDULED" && publishAt && (
        <span className="opacity-70">· {new Date(publishAt).toLocaleDateString()}</span>
      )}
    </span>
  );
}
