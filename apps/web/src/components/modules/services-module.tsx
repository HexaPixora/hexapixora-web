import React from "react";
import Link from "next/link";
import { icons, Wrench } from "lucide-react";
import { servicesSchema, ServicesProps } from "@/lib/module-schemas/services-schema";

// Resolve a lucide icon by name. Accepts names copied straight from lucide.dev
// (kebab-case, e.g. "pen-tool") as well as PascalCase ("PenTool"); falls back
// to Wrench if the name doesn't match.
function iconByName(name?: string) {
  if (!name) return Wrench;
  const pascal = name.trim().replace(/(^|[-_\s])(\w)/g, (_m, _sep, c) => c.toUpperCase());
  return (icons as Record<string, typeof Wrench>)[pascal] || Wrench;
}

export default function ServicesModule({ config }: { config?: ServicesProps }) {
  const { heading, subheading, iconColor, buttonColor, buttonTextColor, items } =
    servicesSchema.parse(config || {});
  const services = items || [];
  // Global card colors (blank = theme).
  const ic = iconColor?.trim();
  const btn = buttonColor?.trim();
  const btnText = buttonTextColor?.trim();

  return (
    <section className="py-24 bg-muted/30 border-y">
      <div className="container">
        <div className="flex flex-col items-center text-center max-w-[800px] mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{heading}</h2>
          {subheading && <p className="text-lg text-muted-foreground">{subheading}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service: any, idx: number) => {
            const Icon = iconByName(service.icon);
            return (
              <div
                key={idx}
                className="group relative flex flex-col bg-background border rounded-2xl p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 hover:border-primary/40"
              >
                <div
                  className={`relative mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/12 ring-1 ring-inset ring-white/10 transition-all duration-300 group-hover:scale-110 ${
                    ic ? "" : "text-[#7cc4ff]"
                  }`}
                  style={ic ? { backgroundColor: `${ic}1f`, color: ic } : undefined}
                >
                  <Icon className="h-7 w-7" strokeWidth={2} />
                </div>

                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-muted-foreground mb-6 line-clamp-3 flex-grow">
                  {service.description || "No description provided."}
                </p>

                {service.link && service.buttonText && (
                  <Link
                    href={service.link}
                    className={`mt-auto self-start inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                      btn
                        ? `hover:-translate-y-0.5 hover:opacity-90 ${btnText ? "" : "text-white"}`
                        : "bg-gradient-to-b from-[#2a9dff] to-[#1074e0] text-white hover:scale-105"
                    }`}
                    style={{
                      ...(btn ? { backgroundColor: btn } : {}),
                      ...(btnText ? { color: btnText } : {}),
                    }}
                  >
                    {service.buttonText}
                  </Link>
                )}
              </div>
            );
          })}

          {services.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
              No services found. Add some in the CMS.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
