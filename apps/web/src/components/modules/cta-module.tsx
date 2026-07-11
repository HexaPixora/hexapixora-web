import React from "react";
import { ctasectionSchema, CTAProps } from "@/lib/module-schemas/ctasection-schema";

export default function CTAModule({ config }: { config?: CTAProps }) {
  const {
    title = "Ready to get started?",
    subtitle = "Join us today and transform your business.",
    buttonText = "Get in Touch",
    buttonUrl = "/contact",
    backgroundColor = "#0f172a",
  } = ctasectionSchema.parse(config || {});

  // Adapt text + button colors to the chosen background's brightness so the CTA
  // stays legible on either a dark or a light custom color.
  const isDark = (hex: string) => {
    const c = hex.replace("#", "");
    const full = c.length === 3 ? c.split("").map((ch) => ch + ch).join("") : c;
    const rgb = parseInt(full, 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b < 128;
  };
  const dark = backgroundColor ? isDark(backgroundColor) : true;
  const textColor = dark ? "#ffffff" : "#0a0a0a";
  const mutedTextColor = dark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.62)";

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div
          className="relative isolate overflow-hidden rounded-[2rem] border border-white/12 px-6 py-16 text-center shadow-[0_40px_100px_-40px_rgba(16,147,253,0.5)] ring-1 ring-inset ring-white/10 md:px-16 md:py-20"
          style={{ backgroundColor }}
        >
          {/* Ambient brand glows */}
          <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[rgba(16,147,253,0.4)] blur-[100px]" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-[rgba(80,60,220,0.32)] blur-[110px]" />
          {/* Glass light — top sheen + diagonal specular */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent" />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_40%,rgba(255,255,255,0.06)_50%,transparent_60%)]" />

          <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-5">
            <h2 className="text-3xl font-black leading-[1.1] tracking-tight md:text-5xl" style={{ color: textColor }}>
              {title}
            </h2>
            {subtitle && (
              <p className="max-w-xl text-lg md:text-xl" style={{ color: mutedTextColor }}>
                {subtitle}
              </p>
            )}
            {buttonText && (
              <a
                href={buttonUrl}
                className="mt-5 inline-flex h-14 items-center justify-center rounded-full px-10 text-base font-semibold shadow-[0_16px_40px_-12px_rgba(0,0,0,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_50px_-12px_rgba(0,0,0,0.7)]"
                style={{ backgroundColor: textColor, color: backgroundColor }}
              >
                {buttonText}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
