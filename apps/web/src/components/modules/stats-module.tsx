import React from "react";

export default function StatsModule({ config }: { config: any }) {
  const { 
    heading, subheading, 
    stat1Value, stat1Label,
    stat2Value, stat2Label,
    stat3Value, stat3Label,
    stat4Value, stat4Label
  } = config || {};

  const stats = [
    { value: stat1Value, label: stat1Label },
    { value: stat2Value, label: stat2Label },
    { value: stat3Value, label: stat3Label },
    { value: stat4Value, label: stat4Label },
  ].filter(s => s.value || s.label);

  return (
    <section className="py-24 bg-primary text-primary-foreground">
      <div className="container">
        {(heading || subheading) && (
          <div className="flex flex-col items-center text-center max-w-[800px] mx-auto mb-16">
            {heading && <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{heading}</h2>}
            {subheading && <p className="text-lg opacity-80">{subheading}</p>}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center divide-x-0 md:divide-x divide-primary-foreground/20">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-2">
                {stat.value}
              </span>
              <span className="text-sm md:text-base font-medium opacity-80 uppercase tracking-widest">
                {stat.label}
              </span>
            </div>
          ))}
          
          {stats.length === 0 && (
            <div className="col-span-full opacity-50 py-12 border-2 border-dashed border-primary-foreground/20 rounded-xl">
              Configure your stats in the CMS builder.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
