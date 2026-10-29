import { useId } from "react";
import { safeHref } from "@hexapixora/contracts/links";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { teamSchema } from "@hexapixora/contracts/blocks/legacy/team";
import { ClipReveal } from "@hexapixora/motion/clip-reveal";
import { SafeLink } from "../../components/safe-link";
import { SectionFrame } from "../../components/section-frame";
import { SectionHeading } from "../../components/section-heading";
import { mediaAlt } from "../../lib/media-alt";

/** People as portrait cards with a large index number, name, role and LinkedIn. */
export function TeamBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(teamSchema, config);
  const headingId = useId();
  const members = c.items.filter((member) => member.name || member.image);
  if (members.length === 0) return null;

  return (
    <SectionFrame block="team" labelledBy={c.heading ? headingId : undefined}>
      <SectionHeading id={headingId} heading={c.heading} subheading={c.subheading} />
      <ul className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member, i) => {
          const image = safeHref(member.image);
          return (
            <ClipReveal key={i} as="li" className="lg:[&:nth-child(3n-1)]:mt-16">
              <article>
                <div className="relative aspect-[4/5] overflow-hidden border border-line bg-page-raised">
                  {image ? (
                    <img
                      src={image}
                      alt={mediaAlt(image, member.name)}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span aria-hidden="true" className="wide grid h-full place-items-center text-display-lg text-copy/10">
                      {member.name.charAt(0) || "?"}
                    </span>
                  )}
                  <span aria-hidden="true" className="mono absolute left-4 top-4 text-signal">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="wide mt-5 text-title font-medium">{member.name}</h3>
                {member.role ? <p className="mt-1 text-copy-dim">{member.role}</p> : null}
                {member.linkedin && member.linkedin !== "#" ? (
                  <SafeLink href={member.linkedin} className="mono mt-3 inline-block transition-colors hover:text-signal">
                    LinkedIn <span className="sr-only">: {member.name}</span>
                  </SafeLink>
                ) : null}
              </article>
            </ClipReveal>
          );
        })}
      </ul>
    </SectionFrame>
  );
}
