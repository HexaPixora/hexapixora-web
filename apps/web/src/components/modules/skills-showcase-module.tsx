import React from "react";
import { Sparkles } from "lucide-react";
import { skillsShowcaseSchema, SkillsShowcaseProps } from "@/lib/module-schemas/skills-showcase-schema";

function clampLevel(v: string): number {
  const n = parseInt(String(v).replace(/[^0-9]/g, ""), 10);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

export default function SkillsShowcaseModule({ config }: { config?: SkillsShowcaseProps }) {
  const { eyebrow, heading, subheading, name, role, avatar, skills } = skillsShowcaseSchema.parse(config || {});
  const list = (skills || []).filter((s: any) => s.name);

  if (!heading && list.length === 0) return null;

  return (
    <section className="relative isolate overflow-hidden py-20 md:py-28">
      <div aria-hidden className="pointer-events-none absolute -left-24 top-10 -z-10 h-[40vh] w-[40vh] rounded-full bg-[rgba(16,147,253,0.1)] blur-[120px]" />

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

        {/* Optional person */}
        {(name || avatar) && (
          <div className="mx-auto mt-10 flex items-center justify-center gap-4">
            {avatar && (
              <span className="h-14 w-14 overflow-hidden rounded-full border border-white/12 ring-1 ring-inset ring-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatar} alt={name || "Team member"} className="h-full w-full object-cover" />
              </span>
            )}
            {(name || role) && (
              <div className="text-left">
                {name && <p className="font-bold text-foreground">{name}</p>}
                {role && <p className="text-sm text-muted-foreground">{role}</p>}
              </div>
            )}
          </div>
        )}

        {/* Skill bars */}
        {list.length > 0 && (
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
            {list.map((s: any, i: number) => {
              const lvl = clampLevel(s.level);
              return (
                <div key={i}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{s.name}</span>
                    <span className="font-semibold text-[#7cc4ff]">{lvl}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.06] ring-1 ring-inset ring-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#2a9dff] to-[#1074e0] shadow-[0_0_12px_0_rgba(16,147,253,0.5)]"
                      style={{ width: `${lvl}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
