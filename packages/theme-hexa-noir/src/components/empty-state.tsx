import type { ReactNode } from "react";

/** A quiet bordered note for lists with nothing in them yet. */
export function EmptyState({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div data-part="empty-state" className="border border-line px-8 py-14">
      <p className="mono text-signal">{label}</p>
      <div className="mt-3 max-w-[56ch] text-lg text-copy-dim">{children}</div>
    </div>
  );
}
