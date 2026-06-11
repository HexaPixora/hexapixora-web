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

  // Simple utility to determine text color based on background darkness
  const isDark = (hex: string) => {
    const c = hex.substring(1);      
    const rgb = parseInt(c, 16);   
    const r = (rgb >> 16) & 0xff;  
    const g = (rgb >>  8) & 0xff;  
    const b = (rgb >>  0) & 0xff;  
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma < 128;
  };

  const textColor = backgroundColor ? (isDark(backgroundColor) ? '#ffffff' : '#000000') : '#ffffff';
  const mutedTextColor = backgroundColor ? (isDark(backgroundColor) ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)') : 'rgba(255,255,255,0.7)';

  return (
    <section className="py-24" style={{ backgroundColor }}>
      <div className="container flex flex-col items-center text-center gap-6">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight" style={{ color: textColor }}>
          {title}
        </h2>
        {subtitle && (
          <p className="max-w-[600px] text-lg md:text-xl" style={{ color: mutedTextColor }}>
            {subtitle}
          </p>
        )}
        {buttonText && (
          <div className="mt-8">
            <a 
              href={buttonUrl} 
              className="inline-flex items-center justify-center rounded-md text-base font-semibold transition-transform hover:scale-105 h-14 px-10"
              style={{
                backgroundColor: textColor,
                color: backgroundColor
              }}
            >
              {buttonText}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
