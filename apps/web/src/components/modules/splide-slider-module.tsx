"use client";

import React, { useEffect, useRef } from "react";
import Splide from "@splidejs/splide";
import "@splidejs/splide/css";
import { ArrowRight } from "lucide-react";

interface SlideItem {
  image?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
}

interface SplideSliderModuleProps {
  type: string;
  label: string;
  config: {
    heading?: string;
    subheading?: string;
    type?: "loop" | "slide" | "fade";
    autoplay?: boolean;
    interval?: string;
    speed?: string;
    arrows?: boolean;
    pagination?: boolean;
    height?: string;
    items?: SlideItem[];
  };
}

export default function SplideSliderModule({ config }: SplideSliderModuleProps) {
  const {
    heading,
    subheading,
    type = "loop",
    autoplay = true,
    interval = "5000",
    speed = "800",
    arrows = true,
    pagination = true,
    height = "500px",
    items = []
  } = config;

  const splideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!splideRef.current || items.length === 0) return;

    const splide = new Splide(splideRef.current, {
      type: type === "fade" ? "fade" : type,
      rewind: type === "slide",
      autoplay: autoplay,
      interval: parseInt(interval) || 5000,
      speed: parseInt(speed) || 800,
      arrows: arrows,
      pagination: pagination,
      height: height,
      classes: {
        arrows: "splide__arrows custom-arrows",
        arrow: "splide__arrow custom-arrow",
        prev: "splide__arrow--prev custom-prev",
        next: "splide__arrow--next custom-next",
        pagination: "splide__pagination custom-pagination",
        page: "splide__pagination__page custom-page",
      },
    });

    splide.mount();

    return () => {
      splide.destroy();
    };
  }, [type, autoplay, interval, speed, arrows, pagination, height, items]);

  if (items.length === 0) {
    return (
      <section className="container py-16">
        <div className="bg-muted/30 border border-dashed rounded-2xl p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
          <p className="font-semibold text-lg text-foreground">Splide Image Carousel</p>
          <p className="text-sm mt-1">Please add slides in the module settings.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-background overflow-hidden">
      <div className="container max-w-7xl mx-auto px-4">
        {(heading || subheading) && (
          <div className="mb-12 text-center max-w-3xl mx-auto space-y-3">
            {heading && <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">{heading}</h2>}
            {subheading && <p className="text-muted-foreground text-lg">{subheading}</p>}
          </div>
        )}

        <div className="relative rounded-3xl overflow-hidden shadow-2xl border bg-black/5">
          <div ref={splideRef} className="splide w-full h-full">
            <div className="splide__track h-full">
              <ul className="splide__list h-full">
                {items.map((slide, index) => (
                  <li key={index} className="splide__slide relative w-full h-full">
                    {/* Background Image */}
                    {slide.image ? (
                      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.image})` }}>
                        <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px]" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950" />
                    )}

                    {/* Content Layer */}
                    <div className="relative z-10 h-full flex flex-col justify-center items-start px-8 md:px-16 lg:px-24 py-12 max-w-4xl text-left">
                      <div className="space-y-6">
                        {slide.title && (
                          <h3 className="text-3xl md:text-6xl font-black text-white leading-tight tracking-tight animate-fade-in">
                            {slide.title}
                          </h3>
                        )}
                        {slide.description && (
                          <p className="text-slate-300 text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
                            {slide.description}
                          </p>
                        )}
                        {slide.buttonText && slide.buttonUrl && (
                          <div className="pt-4">
                            <a
                              href={slide.buttonUrl}
                              className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all hover:scale-[1.02] gap-2"
                            >
                              {slide.buttonText}
                              <ArrowRight size={16} />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
