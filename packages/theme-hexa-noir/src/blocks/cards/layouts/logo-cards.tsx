import { safeHref } from "@hexapixora/contracts/links";
import type { CardItem } from "../cards-block";

/** Groups by label (category) in first-seen order; one unnamed group when none are set. */
function groupByLabel(items: CardItem[]) {
  const withLabels = items.some((item) => item.label.trim());
  const groups = new Map<string, CardItem[]>();
  for (const item of items) {
    const key = withLabels ? item.label.trim() || "Other" : "";
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return [...groups.entries()];
}

/** Names with small logos, as rows grouped by category (a tech stack, tools, partners). */
export function LogoCards({ items }: { items: CardItem[] }) {
  return (
    <div className="grid gap-px border border-line bg-line">
      {groupByLabel(items).map(([label, group]) => (
        <div key={label} className="grid gap-4 bg-page p-6 md:grid-cols-[180px_minmax(0,1fr)] md:items-baseline">
          {label ? <h3 className="mono text-copy-dim">{label}</h3> : null}
          <ul className={`flex flex-wrap gap-x-6 gap-y-3 ${label ? "" : "md:col-span-2"}`}>
            {group.map((item, i) => {
              const icon = safeHref(item.icon);
              return (
                <li key={i} className="flex items-center gap-2.5 text-lg font-semibold">
                  {icon ? (
                    <img
                      src={icon}
                      alt=""
                      width={22}
                      height={22}
                      loading="lazy"
                      decoding="async"
                      className="h-[22px] w-[22px] object-contain"
                    />
                  ) : (
                    <span aria-hidden="true" className="text-signal">
                      /
                    </span>
                  )}
                  {item.title}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
