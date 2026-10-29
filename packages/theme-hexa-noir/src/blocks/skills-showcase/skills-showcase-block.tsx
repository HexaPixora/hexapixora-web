import { useId } from "react";
import { safeHref } from "@hexapixora/contracts/links";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { skillsShowcaseSchema } from "@hexapixora/contracts/blocks/legacy/skills-showcase";
import { SectionFrame } from "../../components/section-frame";
import { SectionHeading } from "../../components/section-heading";
import { mediaAlt } from "../../lib/media-alt";

function clampLevel(value: string): number {
  const n = parseInt(value.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
}

/** Skills with level bars, optionally introduced by a person. */
export function SkillsShowcaseBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(skillsShowcaseSchema, config);
  const headingId = useId();
  const skills = c.skills.filter((skill) => skill.name);
  const avatar = safeHref(c.avatar);
  if (!c.heading && skills.length === 0) return null;

  return (
    <SectionFrame block="skills-showcase" labelledBy={c.heading ? headingId : undefined}>
      <SectionHeading id={headingId} eyebrow={c.eyebrow} heading={c.heading} subheading={c.subheading} />

      {c.name || avatar ? (
        <div className="mb-12 flex items-center gap-4">
          {avatar ? (
            <img
              src={avatar}
              alt={mediaAlt(avatar, c.name)}
              width={56}
              height={56}
              loading="lazy"
              decoding="async"
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : null}
          <div>
            {c.name ? <p className="wide text-title font-medium">{c.name}</p> : null}
            {c.role ? <p className="text-copy-dim">{c.role}</p> : null}
          </div>
        </div>
      ) : null}

      <ul className="grid max-w-[960px] gap-x-12 gap-y-7 sm:grid-cols-2">
        {skills.map((skill, i) => {
          const level = clampLevel(skill.level);
          return (
            <li key={i}>
              <div className="mb-2 flex items-baseline justify-between gap-4">
                <span className="font-semibold">{skill.name}</span>
                <span className="mono text-signal">{level}%</span>
              </div>
              <span
                role="progressbar"
                aria-label={skill.name}
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
    </SectionFrame>
  );
}
