import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { pillarsSchema } from "@hexapixora/contracts/blocks/pillars";
import { ClipReveal } from "@hexapixora/motion/clip-reveal";
import { ChapterHeading } from "../../components/chapter-heading";
import { SafeLink } from "../../components/safe-link";
import { SectionFrame } from "../../components/section-frame";

/** "Web design | /services/web" → label plus optional link. */
function parseServices(text: string) {
  return text
    .split("\n")
    .map((line) => {
      const [label = "", url = ""] = line.split("|").map((part) => part.trim());
      return { label, url };
    })
    .filter((service) => service.label);
}

export function PillarsBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(pillarsSchema, config);
  const headingId = useId();
  if (c.items.length === 0) return null;

  return (
    <SectionFrame block="pillars" labelledBy={c.heading ? headingId : undefined}>
      <ChapterHeading id={headingId} chapter={c.chapter} heading={c.heading} aside={c.aside} />
      {c.items.map((item, i) => (
        <ClipReveal
          key={i}
          className="grid items-start gap-[30px] border-t border-line py-11 md:grid-cols-[140px_minmax(0,1fr)_minmax(0,1fr)]"
        >
          <span className="mono pt-3.5 text-signal">{item.label}</span>
          <h3 className="wide text-display-pillar font-bold">{item.title}</h3>
          <div className="grid gap-4 pt-2.5">
            {item.text ? <p>{item.text}</p> : null}
            <ul data-part="service-list" className="grid gap-1.5 font-semibold">
              {parseServices(item.services).map((service, j) => (
                <li key={j}>
                  <SafeLink href={service.url} keepText className="underline-offset-4 hover:text-signal hover:underline">
                    {service.label}
                  </SafeLink>
                </li>
              ))}
            </ul>
          </div>
        </ClipReveal>
      ))}
    </SectionFrame>
  );
}
