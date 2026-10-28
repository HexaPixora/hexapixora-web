import { StatusPill } from "@hexapixora/ui/status-pill";
import { CONTENT_STATUS } from "@hexapixora/ui/status-colors";
import type { ContentStatus } from "./status-control";

/** Small pill showing a content item's publish status, with the scheduled time when relevant. */
export function StatusBadge({
  status,
  publishAt,
}: {
  status?: ContentStatus | null;
  publishAt?: string | null;
}) {
  const style = CONTENT_STATUS[status ?? "DRAFT"] ?? CONTENT_STATUS.DRAFT;
  const scheduled = status === "SCHEDULED" && publishAt;
  return (
    <StatusPill style={style} className="gap-1" title={scheduled ? new Date(publishAt).toLocaleString() : undefined}>
      {scheduled && <span className="opacity-70">· {new Date(publishAt).toLocaleDateString()}</span>}
    </StatusPill>
  );
}
