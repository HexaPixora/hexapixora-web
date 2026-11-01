import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import type { SiteBrand } from "@/lib/site-brand";

const siteUrl = process.env.SITE_URL || "";
const siteHost = (() => {
  try {
    return new URL(siteUrl).host;
  } catch {
    return "";
  }
})();

function BrandMark({ brand, size }: { brand: SiteBrand; size: "sm" | "lg" }) {
  const box = size === "lg" ? "h-10 w-10" : "h-8 w-8";
  return brand.logoUrl ? (
    // Media-library logo of any size; a plain img keeps it out of image optimisation.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={brand.logoUrl} alt="" className={`${box} flex-shrink-0 object-contain`} />
  ) : (
    <span
      aria-hidden="true"
      className={`${box} flex flex-shrink-0 items-center justify-center bg-primary font-heading text-xs font-medium text-primary-foreground`}
    >
      {brand.siteName.slice(0, 2).toUpperCase()}
    </span>
  );
}

/**
 * Layout for the screens before sign-in (login, password reset, email
 * verification): a brand panel in the theme's colours beside a calm form
 * column. Colours, fonts and corners all come from the active theme pack.
 */
export function AuthShell({
  brand,
  title,
  description,
  children,
}: {
  brand: SiteBrand;
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-dvh bg-background text-foreground lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-sidebar-border bg-sidebar p-10 text-sidebar-foreground lg:flex">
        {/* Decoration only: a fading line grid and a glow in the theme's signal colour. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--sidebar-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--sidebar-border)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_30%_60%,black,transparent_75%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-1/3 -left-1/4 h-[80%] w-[90%] bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--primary)_30%,transparent),transparent)]"
        />

        <div className="relative flex items-center gap-3">
          <BrandMark brand={brand} size="lg" />
          <span className="font-heading text-base font-medium">{brand.siteName}</span>
        </div>

        <div className="relative max-w-md">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
          <p className="mt-4 font-heading text-3xl font-medium leading-tight tracking-tight xl:text-4xl">
            {brand.tagline ?? "Pages, posts, leads and design in one place."}
          </p>
        </div>

        <div className="relative flex items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>Signed-in area. Not indexed.</span>
          {siteHost && (
            <a href={siteUrl} className="inline-flex items-center gap-1 hover:text-foreground">
              {siteHost}
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          )}
        </div>
      </aside>

      <main className="flex flex-col px-4 py-8 sm:px-8">
        <div className="flex items-center gap-2.5 lg:hidden">
          <BrandMark brand={brand} size="sm" />
          <span className="font-heading text-sm font-medium">{brand.siteName}</span>
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="font-heading text-2xl font-medium tracking-tight">{title}</h1>
          {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
