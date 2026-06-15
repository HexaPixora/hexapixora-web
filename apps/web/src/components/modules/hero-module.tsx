import React from "react";
import { heroSchema, HeroProps } from "@/lib/module-schemas/hero-schema";

export default function HeroModule({ config }: { config?: HeroProps }) {
  const {
    heading,
    subheading,
    buttonText,
    buttonUrl,
    secondaryButtonText,
    secondaryButtonUrl,
    backgroundImage,
  } = heroSchema.parse(config || {});


  return (
    <section
      className="relative min-h-[92vh] flex items-center border-b"
      style={backgroundImage ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : {}}
    >
      {backgroundImage && <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-0"></div>}

      <div className="container relative z-2 grid grid-cols-12 gap-6 py-20 md:py-32 w-full">
        <div className="flex flex-col col-span-12 md:col-span-12 items-start gap-6">
          <h1 className="text-6xl font-extrabold leading-tight tracking-tighter md:text-5xl lg:text-9xl">
            {heading}
          </h1>
          {subheading && (
            <p className="text-lg text-muted-foreground md:text-2xl leading-relaxed">
              {subheading}
            </p>
          )}

          <div className="flex flex-wrap gap-4 mt-6">
            {buttonText && (
              <a href={buttonUrl} className="inline-flex items-center justify-center rounded-md text-base font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 shadow-lg shadow-primary/20">
                {buttonText}
              </a>
            )}
            {secondaryButtonText && (
              <a href={secondaryButtonUrl} className="inline-flex items-center justify-center rounded-md text-base font-medium transition-colors border-2 border-primary/20 bg-background hover:bg-muted h-12 px-8">
                {secondaryButtonText}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
