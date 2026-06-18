import React from "react";
import { pricingSchema, PricingProps } from "@/lib/module-schemas/pricing-schema";
import { Check, Star } from "lucide-react";

export default function PricingModule({ config }: { config?: PricingProps }) {
  const { heading, subheading, backgroundColor, plans } = pricingSchema.parse(config || {});

  const isDark = (hex: string) => {
    if (!/^#?[0-9a-fA-F]{6}$/.test(hex || "")) return false;
    const c = (hex || "").replace("#", "");
    const rgb = parseInt(c, 16);
    const luma = 0.2126 * ((rgb >> 16) & 0xff) + 0.7152 * ((rgb >> 8) & 0xff) + 0.0722 * (rgb & 0xff);
    return luma < 128;
  };
  const dark = isDark(backgroundColor);
  const heat = dark ? "#ffffff" : "#0f172a";
  const muted = dark ? "rgba(255,255,255,0.7)" : "rgba(15,23,42,0.6)";

  return (
    <section className="py-24" style={{ backgroundColor }}>
      <div className="container">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl" style={{ color: heat }}>
            {heading}
          </h2>
          {subheading && (
            <p className="mt-4 text-lg" style={{ color: muted }}>
              {subheading}
            </p>
          )}
        </div>

        <div className="mx-auto grid max-w-6xl items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(plans || []).map((plan, i) => {
            const features = (plan.features || "")
              .split("\n")
              .map((f) => f.trim())
              .filter(Boolean);
            return (
              <div
                key={i}
                className={`relative flex flex-col rounded-2xl border p-7 transition-transform ${
                  plan.highlighted
                    ? "border-primary bg-primary/[0.04] shadow-xl shadow-primary/10 md:scale-[1.03]"
                    : "border-muted/50 bg-card/40"
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow">
                    <Star size={12} /> Most popular
                  </span>
                )}
                <h3 className="text-lg font-semibold" style={{ color: heat }}>
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm" style={{ color: muted }}>
                  {plan.description}
                </p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight" style={{ color: heat }}>
                    {plan.price}
                  </span>
                  {plan.period && <span className="text-sm" style={{ color: muted }}>{plan.period}</span>}
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-sm" style={{ color: heat }}>
                      <Check size={16} className="mt-0.5 flex-shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {plan.buttonText && (
                  <a
                    href={plan.buttonUrl || "/contact"}
                    className={`mt-7 inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold transition-transform hover:scale-[1.02] ${
                      plan.highlighted
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "border border-primary/40 text-primary hover:bg-primary/10"
                    }`}
                  >
                    {plan.buttonText}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
