import { useId } from "react";
import { safeHref } from "@hexapixora/contracts/links";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { techStackSchema } from "@hexapixora/contracts/blocks/tech-stack";
import { SectionFrame } from "../../components/section-frame";
import { SectionHeading } from "../../components/section-heading";

type Tech = { name: string; icon: string; category: string };

/** Groups by category in first-seen order; one unnamed group when none are set. */
function groupByCategory(list: Tech[]) {
  const withCategories = list.some((tech) => tech.category.trim());
  const groups = new Map<string, Tech[]>();
  for (const tech of list) {
    const key = withCategories ? tech.category.trim() || "Other" : "";
    groups.set(key, [...(groups.get(key) ?? []), tech]);
  }
  return [...groups.entries()];
}

/** The tools behind the work, as rows of labels grouped by category. */
export function TechStackBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(techStackSchema, config);
  const headingId = useId();
  const list = c.technologies.filter((tech) => tech.name);
  if (!c.heading && list.length === 0) return null;

  return (
    <SectionFrame block="tech-stack" labelledBy={c.heading ? headingId : undefined}>
      <SectionHeading id={headingId} eyebrow={c.eyebrow} heading={c.heading} subheading={c.subheading} />
      <div className="grid gap-px border border-line bg-line">
        {groupByCategory(list).map(([category, items]) => (
          <div key={category} className="grid gap-4 bg-page p-6 md:grid-cols-[180px_minmax(0,1fr)] md:items-baseline">
            {category ? <h3 className="mono text-copy-dim">{category}</h3> : null}
            <ul className={`flex flex-wrap gap-x-6 gap-y-3 ${category ? "" : "md:col-span-2"}`}>
              {items.map((tech, i) => {
                const icon = safeHref(tech.icon);
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
                    {tech.name}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </SectionFrame>
  );
}
