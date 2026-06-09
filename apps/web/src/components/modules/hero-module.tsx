import React from "react";

export default function HeroModule({ config }: { config: any }) {
  const {
    heading = "Beautifully designed experiences",
    subheading = "Built with modern tools. We deliver high performance scalable solutions.",
    buttonText = "View Services",
    buttonUrl = "/services",
    secondaryButtonText = "Contact Us",
    secondaryButtonUrl = "/contact",
    backgroundImage = "",
  } = config || {};

  return (
    <section 
      className="relative container flex flex-col items-start justify-center gap-6 py-20 md:py-32 border-b"
      style={backgroundImage ? { 
        backgroundImage: `url(${backgroundImage})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
      } : {}}
    >
      {backgroundImage && <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-0"></div>}
      
      <div className="relative z-10 flex max-w-[980px] flex-col items-start gap-4">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tighter md:text-5xl lg:text-7xl">
          {heading}
        </h1>
        {subheading && (
          <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl leading-relaxed">
            {subheading}
          </p>
        )}
      </div>
      
      <div className="relative z-10 flex flex-wrap gap-4 mt-6">
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
    </section>
  );
}
