import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { servicesSchema } from "@hexapixora/contracts/blocks/services";
import { ClipReveal } from "@hexapixora/motion/clip-reveal";
import { ContentIcon } from "../../components/content-icon";
import { SafeLink } from "../../components/safe-link";
import { SectionFrame } from "../../components/section-frame";
import { SectionHeading } from "../../components/section-heading";

/**
 * Service cards with an icon, text and a link. The stored icon and button
 * colours are ignored: the theme owns colour.
 */
export function ServicesBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(servicesSchema, config);
  const headingId = useId();
  const services = c.items.filter((item) => item.title);
  if (services.length === 0) return null;

  return (
    <SectionFrame block="services" labelledBy={c.heading ? headingId : undefined}>
      <SectionHeading id={headingId} heading={c.heading} subheading={c.subheading} />
      <ul className="grid gap-px border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => (
          <ClipReveal
            key={i}
            as="li"
            className="group relative flex flex-col gap-4 bg-page p-7 transition-colors duration-[400ms] hover:bg-page-raised"
          >
            <span className="mono text-copy-dim">{String(i + 1).padStart(2, "0")}</span>
            <ContentIcon name={service.icon} className="h-8 w-8 text-signal" />
            <h3 className="wide text-title font-medium">{service.title}</h3>
            {service.description ? <p className="flex-1 text-copy-dim">{service.description}</p> : null}
            {service.link && service.buttonText ? (
              <SafeLink
                href={service.link}
                className="mono mt-2 self-start transition-colors duration-300 after:absolute after:inset-0 hover:text-signal"
              >
                {service.buttonText} <span aria-hidden="true">→</span>
              </SafeLink>
            ) : null}
          </ClipReveal>
        ))}
      </ul>
    </SectionFrame>
  );
}
