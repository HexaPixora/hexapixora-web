import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { pricingSchema } from "@hexapixora/contracts/blocks/legacy/pricing";
import { ClipReveal } from "@hexapixora/motion/clip-reveal";
import { PillLink } from "../../components/pill-link";
import { SectionFrame } from "../../components/section-frame";
import { SectionHeading } from "../../components/section-heading";

/**
 * Price plans side by side; the highlighted plan is filled with the signal
 * colour. The stored background colour is ignored (the theme owns colour).
 */
export function PricingBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(pricingSchema, config);
  const headingId = useId();
  const plans = c.plans.filter((plan) => plan.name);
  if (plans.length === 0) return null;

  return (
    <SectionFrame block="pricing" labelledBy={c.heading ? headingId : undefined}>
      <SectionHeading id={headingId} heading={c.heading} subheading={c.subheading} />
      <ul className="grid gap-px border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan, i) => {
          const features = plan.features
            .split("\n")
            .map((feature) => feature.trim())
            .filter(Boolean);
          return (
            <ClipReveal
              key={i}
              as="li"
              className={`flex flex-col p-8 ${plan.highlighted ? "bg-signal text-on-signal" : "bg-page"}`}
            >
              <p className="mono">{plan.highlighted ? "Most popular" : " "}</p>
              <h3 className="wide mt-4 text-title font-medium">{plan.name}</h3>
              {plan.description ? (
                <p className={`mt-2 ${plan.highlighted ? "text-on-signal-dim" : "text-copy-dim"}`}>{plan.description}</p>
              ) : null}
              <p className="mt-6 flex items-baseline gap-2">
                <span className="font-display text-display-md font-medium leading-none">{plan.price}</span>
                {plan.period ? <span className="mono">{plan.period}</span> : null}
              </p>
              {features.length > 0 ? (
                <ul className="mt-8 grid flex-1 content-start gap-2.5">
                  {features.map((feature, j) => (
                    <li key={j} className="flex gap-3">
                      <span aria-hidden="true" className={plan.highlighted ? "" : "text-signal"}>
                        /
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              ) : null}
              {plan.buttonText ? (
                <div className="mt-8">
                  <PillLink
                    href={plan.buttonUrl || "/contact-us"}
                    variant={plan.highlighted ? "outline" : "solid"}
                  >
                    {plan.buttonText}
                  </PillLink>
                </div>
              ) : null}
            </ClipReveal>
          );
        })}
      </ul>
    </SectionFrame>
  );
}
