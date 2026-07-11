import React from "react";
import { Sparkles } from "lucide-react";
import { techStackSchema, TechStackProps } from "@/lib/module-schemas/tech-stack-schema";

export default function TechStackModule({ config }: { config?: TechStackProps }) {
  const { eyebrow, heading, subheading, technologies } = techStackSchema.parse(config || {});
  const list = (technologies || []).filter((t: any) => t.name);
  const hasCategories = list.some((t: any) => t.category?.trim());

  if (!heading && list.length === 0) return null;

  // Group by category (in first-seen order); flat single group when none are set.
  const groups: { label: string; items: any[] }[] = [];
  const byKey = new Map<string, { label: string; items: any[] }>();
  for (const t of list) {
    const key = hasCategories ? t.category?.trim() || "Other" : "";
    let g = byKey.get(key);
    if (!g) {
      g = { label: key, items: [] };
      byKey.set(key, g);
      groups.push(g);
    }
    g.items.push(t);
  }

  return (
    <section className="relative isolate overflow-hidden py-20 md:py-28">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[36vh] w-[70vh] -translate-x-1/2 rounded-full bg-[rgba(16,147,253,0.1)] blur-[120px]" />

      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          {eyebrow && (
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3.5 py-1.5 text-xs font-semibold text-[#7cc4ff] ring-1 ring-inset ring-white/10">
              <Sparkles size={13} /> {eyebrow}
            </span>
          )}
          {heading && (
            <h2 className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-3xl font-black leading-[1.15] tracking-tight text-transparent md:text-5xl">
              {heading}
            </h2>
          )}
          {subheading && <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{subheading}</p>}
        </div>

        {list.length > 0 && (
          <div className="mx-auto mt-14 max-w-5xl space-y-8">
            {groups.map((g, gi) => (
              <div key={gi}>
                {g.label && (
                  <h3 className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {g.label}
                  </h3>
                )}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {g.items.map((t: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 ring-1 ring-inset ring-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20"
                    >
                      {t.icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.icon} alt={t.name} className="h-6 w-6 flex-shrink-0 object-contain" />
                      ) : (
                        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[#1093fd] shadow-[0_0_8px_1px_rgba(16,147,253,0.6)]" />
                      )}
                      <span className="truncate text-sm font-medium text-foreground">{t.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
