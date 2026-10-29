import { StatValue } from "./stat-value";

/**
 * Stats in a ruled grid: the value large, its label underneath. By default,
 * values that start with a whole number count up on first view; the server renders the
 * final values, so search engines and no-JS visitors read the real numbers.
 */
export function StatGrid({
  stats,
  count = true,
}: {
  stats: ReadonlyArray<{ value: string; label: string }>;
  /** false: show the values as written, without counting up. */
  count?: boolean;
}) {
  if (stats.length === 0) return null;
  return (
    <dl className="grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-4">
      {stats.map((stat, i) => (
        <div key={i} className="flex flex-col-reverse bg-page p-[26px]">
          <dt className="text-copy-dim">{stat.label}</dt>
          <dd className="font-display text-display-md font-medium leading-none">
            {count ? <StatValue value={stat.value} /> : stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
