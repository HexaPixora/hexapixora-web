import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { pricingSchema } from "@hexapixora/contracts/blocks/pricing";
import { ClipReveal } from "@hexapixora/motion/clip-reveal";
import { BlockHead, labelledBy } from "../../components/block-head";
import { PillLink } from "../../components/pill-link";
import { SectionFrame } from "../../components/section-frame";
import type { BlockProps } from "../../lib/block-props";

/**
 * Price plans side by side; the highlighted plan is filled with the signal
 * colour.
 */
export function PricingBlock({ config }: BlockProps) {
  const c = parseBlockConfig(pricingSchema, config);
  const headingId = useId();
  const plans = c.items.filter((plan) => plan.title);
  if (plans.length === 0) return null;

  return (
    <SectionFrame block="pricing" variant={c.layout} surface={c.surface} labelledBy={labelledBy(headingId, c)}>
      <BlockHead id={headingId} head={c} />
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
              <h3 className="wide mt-4 text-title font-medium">{plan.title}</h3>
              {plan.text ? (
                <p className={`mt-2 ${plan.highlighted ? "text-on-signal-dim" : "text-copy-dim"}`}>{plan.text}</p>
              ) : null}
              <p className="mt-6 flex items-baseline gap-2">
                <span className="font-display text-display-md font-medium leading-none">{plan.value}</span>
                {plan.suffix ? <span className="mono">{plan.suffix}</span> : null}
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
              {plan.linkText ? (
                <div className="mt-8">
                  <PillLink href={plan.url || "/contact-us"} variant={plan.highlighted ? "outline" : "solid"}>
                    {plan.linkText}
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
