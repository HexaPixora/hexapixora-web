"use client";

import React, { useEffect, useRef } from "react";
import { splideLogoTickerSchema, SplideLogoTickerProps } from "@/lib/module-schemas/splide-logo-ticker-schema";

import Splide from "@splidejs/splide";
import "@splidejs/splide/css";





export default function SplideLogoTickerModule({ config }: { config?: SplideLogoTickerProps }) {
  const {
    heading,
    speed = "1",
    perPage = "5",
    logos = []
  } = splideLogoTickerSchema.parse(config || {});

  const splideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!splideRef.current || logos.length === 0) return;

    // Calculate transition speed based on multiplier
    const speedVal = 6000 / (parseFloat(speed) || 1);

    const splide = new Splide(splideRef.current, {
      type: "loop",
      drag: false, // disable dragging for continuous tickers
      focus: "center",
      arrows: false,
      pagination: false,
      gap: "4rem",
      perPage: parseInt(perPage) || 5,
      autoplay: true,
      interval: 0, // continuous
      speed: speedVal,
      easing: "linear",
      breakpoints: {
        1024: {
          perPage: Math.max(3, (parseInt(perPage) || 5) - 1),
          gap: "3rem",
        },
        768: {
          perPage: Math.max(2, (parseInt(perPage) || 5) - 2),
          gap: "2rem",
        },
        480: {
          perPage: 2,
          gap: "1.5rem",
        }
      }
    });

    splide.mount();

    return () => {
      splide.destroy();
    };
  }, [speed, perPage, logos]);

  if (logos.length === 0) {
    return (
      <section className="container py-12 border-b">
        <div className="bg-muted/30 border border-dashed rounded-xl p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
          <p className="font-semibold text-foreground">Splide Logo Ticker</p>
          <p className="text-xs mt-1">Please add logos in the settings.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-muted/20 border-y overflow-hidden">
      <div className="container max-w-7xl mx-auto px-4">
        {heading && (
          <h4 className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-8">
            {heading}
          </h4>
        )}

        <div ref={splideRef} className="splide w-full select-none pointer-events-none">
          <div className="splide__track">
            <ul className="splide__list items-center">
              {logos.map((logo, index) => (
                <li key={index} className="splide__slide flex items-center justify-center">
                  {logo.image ? (
                    <img
                      src={logo.image}
                      alt={logo.name || `Partner Logo ${index + 1}`}
                      className="h-10 w-auto object-contain opacity-40 hover:opacity-85 transition-opacity max-w-[130px] filter grayscale dark:invert"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-muted-foreground/60">{logo.name || `Partner ${index + 1}`}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
