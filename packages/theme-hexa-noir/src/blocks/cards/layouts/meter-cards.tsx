import type { CardItem } from "../cards-block";

function clampLevel(value: string): number {
  const n = parseInt(value.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
}

/** Skills or capabilities with level bars. */
export function MeterCards({ items }: { items: CardItem[] }) {
  return (
    <ul className="grid max-w-[960px] gap-x-12 gap-y-7 sm:grid-cols-2">
      {items.map((item, i) => {
        const level = clampLevel(item.value);
        return (
          <li key={i}>
            <div className="mb-2 flex items-baseline justify-between gap-4">
              <span className="font-semibold">{item.title}</span>
              <span className="mono text-signal">{level}%</span>
            </div>
            <span
              role="progressbar"
              aria-label={item.title}
              aria-valuenow={level}
              aria-valuemin={0}
              aria-valuemax={100}
              className="relative block h-1 overflow-hidden bg-line"
            >
              <span className="absolute inset-y-0 left-0 bg-signal" style={{ width: `${level}%` }} />
            </span>
          </li>
        );
      })}
    </ul>
  );
}
