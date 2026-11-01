"use client";

/**
 * Leads per week as bars: one series in the theme's accent, so the panel
 * title names it and there is no legend. Each bar shows its count on hover,
 * and the same numbers sit in a table for screen readers.
 */
export function LeadsChart({
  weekly,
  generatedAt,
}: {
  weekly: number[];
  generatedAt: string;
}) {
  const max = Math.max(1, ...weekly);
  const end = new Date(generatedAt);
  const weekLabel = (i: number) => {
    const start = new Date(
      end.getTime() - (weekly.length - i) * 7 * 86_400_000,
    );
    return start.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div>
      <div className="flex h-36 items-end gap-1.5" aria-hidden="true">
        {weekly.map((count, i) => (
          <div
            key={i}
            className="group relative flex h-full flex-1 flex-col justify-end"
          >
            <span className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap border bg-popover px-2 py-1 text-[11px] opacity-0 transition-opacity group-hover:opacity-100">
              Week of {weekLabel(i)}: {count} {count === 1 ? "lead" : "leads"}
            </span>
            <span
              className="block min-h-[2px] rounded-t-[4px] bg-primary transition-[filter] group-hover:brightness-110"
              style={{ height: `${(count / max) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-1.5 border-t pt-1.5" aria-hidden="true">
        {weekly.map((_, i) => (
          <span
            key={i}
            className="flex-1 text-center font-mono text-[10px] text-muted-foreground"
          >
            {i % 3 === 2 || i === weekly.length - 1 ? weekLabel(i) : ""}
          </span>
        ))}
      </div>
      {/* Hidden on a wrapper: a table's caption escapes sr-only on the table itself. */}
      <div className="sr-only">
        <table>
          <caption>Leads per week</caption>
          <thead>
            <tr>
              <th scope="col">Week of</th>
              <th scope="col">Leads</th>
            </tr>
          </thead>
          <tbody>
            {weekly.map((count, i) => (
              <tr key={i}>
                <td>{weekLabel(i)}</td>
                <td>{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
