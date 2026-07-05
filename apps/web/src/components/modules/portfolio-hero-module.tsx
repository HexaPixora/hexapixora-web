"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Globe, ArrowUpRight } from "lucide-react";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { portfolioHeroSchema, PortfolioHeroProps } from "@/lib/module-schemas/portfolio-hero-schema";

/* ---------- small building blocks ---------- */

// Frosted glass surface (blur lives on this -z-10 sibling so text/children above
// it stay crisp — the iOS backdrop-filter softening bug only affects descendants).
function GlassSurface({ className = "" }: { className?: string }) {
  return (
    <>
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 -z-10 rounded-[inherit] border border-white/12 bg-white/[0.05] ring-1 ring-inset ring-white/10 backdrop-blur-2xl ${className}`}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-gradient-to-b from-white/10 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-24px_44px_-30px_rgba(0,0,0,0.6)]" />
    </>
  );
}

// Brand marks as inline single-path SVGs (this lucide build dropped brand icons).
const BRAND_PATHS: Record<string, string> = {
  dribbble: "M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.816zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.858zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.285zm10.335 3.483c-.218.29-1.935 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z",
  behance: "M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988H0V5.021h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zM3 11h3.584c2.508 0 2.906-3-.312-3H3v3zm3.391 3H3v3.016h3.341c3.055 0 2.868-3.016.05-3.016z",
  figma: "M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.354-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.02c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068v-2.971H8.148zm7.704 0h-.098c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h.098c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49zm-.098-7.509c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.019 3.019 3.019h.098c1.665 0 3.019-1.355 3.019-3.019s-1.354-3.019-3.019-3.019h-.098z",
  linkedin: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z",
  github: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  twitter: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z",
};

function SocialGlyph({ platform, className }: { platform: string; className?: string }) {
  const path = BRAND_PATHS[platform];
  if (!path) return <Globe className={className} />;
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d={path} />
    </svg>
  );
}

/* ---------- module ---------- */

export default function PortfolioHeroModule({ config }: { config?: PortfolioHeroProps }) {
  const { eyebrow, name, title, bio, image, availability, skills, stats, ctas, socials } =
    portfolioHeroSchema.parse(config || {});

  const skillList = (skills || []).filter((s) => s.label);
  const statList = (stats || []).filter((s) => s.value || s.label);
  const ctaList = (ctas || []).filter((c) => c.label);
  const socialList = (socials || []).filter((s) => s.url && s.url !== "#");
  const firstName = (name || "").trim().split(" ")[0] || "";

  const rootRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set([".ph-reveal", ".ph-pop"], { opacity: 1, y: 0, scale: 1 });
        return;
      }
      // Entrance — content rises + fades, floating accents pop in.
      gsap.set(".ph-reveal", { opacity: 0, y: 36 });
      gsap.set(".ph-pop", { opacity: 0, scale: 0.9 });
      const tl = gsap.timeline({ delay: 0.08 });
      tl.to(".ph-reveal", { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.11 })
        .to(".ph-pop", { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.6)", stagger: 0.1 }, "-=0.7");

      // Idle float — suspended cards breathe (y only; parallax x/y lives on parents).
      gsap.utils.toArray<HTMLElement>(".ph-float").forEach((el, i) => {
        gsap.to(el, {
          y: "+=14",
          duration: 3 + (i % 3) * 0.7,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: i * 0.35,
        });
      });
    }, root);

    // Parallax layers + cursor-reactive light (fine pointers only).
    let teardown = () => {};
    if (!reduce && window.matchMedia("(pointer: fine)").matches) {
      const layers = gsap.utils.toArray<HTMLElement>("[data-depth]", root).map((el) => ({
        depth: parseFloat(el.dataset.depth || "0"),
        xTo: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3" }),
        yTo: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3" }),
      }));
      const glow = glowRef.current;
      const gx = glow ? gsap.quickTo(glow, "x", { duration: 0.5, ease: "power3" }) : null;
      const gy = glow ? gsap.quickTo(glow, "y", { duration: 0.5, ease: "power3" }) : null;

      const onMove = (e: MouseEvent) => {
        const r = root.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        layers.forEach(({ depth, xTo, yTo }) => {
          xTo(-nx * depth * 26);
          yTo(-ny * depth * 26);
        });
        if (glow && gx && gy) {
          gx(e.clientX - r.left);
          gy(e.clientY - r.top);
          gsap.to(glow, { opacity: 1, duration: 0.3 });
        }
      };
      const onLeave = () => {
        layers.forEach(({ xTo, yTo }) => { xTo(0); yTo(0); });
        if (glow) gsap.to(glow, { opacity: 0, duration: 0.5 });
      };
      root.addEventListener("mousemove", onMove);
      root.addEventListener("mouseleave", onLeave);
      teardown = () => {
        root.removeEventListener("mousemove", onMove);
        root.removeEventListener("mouseleave", onLeave);
      };
    }

    return () => {
      teardown();
      ctx.revert();
    };
  }, []);

  if (!name && !image) {
    return (
      <section className="container py-16">
        <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-white/[0.04] p-12 text-center ring-1 ring-inset ring-white/10">
          <p className="text-lg font-semibold text-foreground">Portfolio Hero</p>
          <p className="mt-1 text-sm text-muted-foreground">Add a name and profile image in the module settings.</p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={rootRef}
      className="relative isolate overflow-hidden py-20 md:py-28 lg:py-32"
    >
      {/* Ambient aurora glows for depth. */}
      <div aria-hidden className="pointer-events-none absolute -left-32 top-0 -z-20 h-[46vh] w-[46vh] rounded-full bg-[rgba(16,147,253,0.16)] blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute -right-24 bottom-0 -z-20 h-[42vh] w-[42vh] rounded-full bg-[rgba(80,60,220,0.14)] blur-[130px]" />

      {/* Cursor-reactive light (desktop) — shows through the translucent glass. */}
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 -z-10 hidden h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(16,147,253,0.22),transparent_62%)] opacity-0 mix-blend-screen md:block"
      />

      {/* Giant background first-name — large type interacting with the image. */}
      {firstName && (
        <div data-depth="0.6" aria-hidden className="pointer-events-none absolute inset-x-0 bottom-2 -z-10 flex justify-center overflow-hidden">
          <span className="ph-reveal select-none whitespace-nowrap bg-gradient-to-b from-white/[0.07] to-white/0 bg-clip-text text-[26vw] font-black leading-none tracking-tighter text-transparent lg:text-[19vw]">
            {firstName}
          </span>
        </div>
      )}

      <div className="container relative">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-0">
          {/* ---------- Content (overlaps the image on lg via col overlap) ---------- */}
          <div className="relative z-20 order-2 lg:order-1 lg:col-span-7 lg:col-start-1 lg:row-start-1 lg:pr-8">
            <div className="relative isolate rounded-[2rem] p-7 sm:p-9 lg:p-11">
              <GlassSurface />

              {availability && (
                <div className="ph-reveal mb-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium text-white/90 ring-1 ring-inset ring-white/10 backdrop-blur-xl">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  {availability}
                </div>
              )}

              {eyebrow && (
                <p className="ph-reveal mb-3 text-sm font-medium uppercase tracking-[0.22em] text-[#7cc4ff]">
                  {eyebrow}
                </p>
              )}

              {name && (
                <h1 className="ph-reveal bg-gradient-to-b from-white to-white/60 bg-clip-text text-4xl font-black leading-[1.08] tracking-tight text-transparent sm:text-5xl lg:text-6xl">
                  {name}
                </h1>
              )}

              {title && (
                <p className="ph-reveal mt-3 text-lg font-medium text-white/80 sm:text-xl">
                  {title}
                </p>
              )}

              {bio && (
                <p className="ph-reveal mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-[1.05rem]">
                  {bio}
                </p>
              )}

              {skillList.length > 0 && (
                <div className="ph-reveal mt-7 flex flex-wrap gap-2.5">
                  {skillList.map((s, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-white/12 bg-white/[0.05] px-3.5 py-1.5 text-sm text-white/85 ring-1 ring-inset ring-white/10 transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.09]"
                    >
                      {s.label}
                    </span>
                  ))}
                </div>
              )}

              {ctaList.length > 0 && (
                <div className="ph-reveal mt-8 flex flex-wrap items-center gap-3">
                  {ctaList.map((c, i) => {
                    const base =
                      "group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300";
                    const styles =
                      c.style === "primary"
                        ? "bg-gradient-to-b from-[#2a9dff] to-[#1074e0] text-white shadow-[0_14px_34px_-12px_rgba(16,147,253,0.7)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-12px_rgba(16,147,253,0.85)]"
                        : c.style === "ghost"
                          ? "text-white/80 hover:text-white"
                          : "border border-white/15 bg-white/[0.05] text-white ring-1 ring-inset ring-white/10 backdrop-blur-xl hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.09]";
                    return (
                      <a key={i} href={c.url || "#"} className={`${base} ${styles}`}>
                        {c.label}
                        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </a>
                    );
                  })}
                </div>
              )}

              {socialList.length > 0 && (
                <div className="ph-reveal mt-8 flex items-center gap-3">
                  {socialList.map((s, i) => (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.platform}
                      className="flex size-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-white/75 ring-1 ring-inset ring-white/10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/30 hover:text-white"
                    >
                      <SocialGlyph platform={s.platform} className="size-[18px]" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ---------- Image + floating accents ---------- */}
          <div className="relative order-1 lg:order-2 lg:col-span-6 lg:col-start-7 lg:row-start-1">
            {/* Portrait — parallax on the wrapper, sharp image inside glass frame. */}
            <div data-depth="1.1" className="relative mx-auto max-w-sm lg:ml-auto lg:mr-0 lg:max-w-md">
              <div className="ph-pop relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/12 shadow-[0_40px_100px_-30px_rgba(16,147,253,0.5)] ring-1 ring-inset ring-white/10">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image} alt={name || "Profile"} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 to-indigo-950" />
                )}
                {/* Sharp image, glassy light on top. */}
                <LiquidGlass tintClass="to-primary-blue/50" />
              </div>
            </div>

            {/* Floating availability-echo / signature stat cards (desktop only). */}
            {statList[0] && (
              <div data-depth="2.6" className="absolute -left-4 top-8 hidden lg:block xl:-left-10">
                <div className="ph-pop ph-float relative isolate rounded-2xl px-5 py-4 text-center">
                  <GlassSurface />
                  <div className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-3xl font-black leading-[1.15] tracking-tight text-transparent">
                    {statList[0].value}
                  </div>
                  <div className="mt-0.5 text-[11px] uppercase tracking-wider text-white/60">{statList[0].label}</div>
                </div>
              </div>
            )}

            {statList[1] && (
              <div data-depth="2.2" className="absolute -right-3 bottom-10 hidden lg:block xl:-right-8">
                <div className="ph-pop ph-float relative isolate rounded-2xl px-5 py-4 text-center">
                  <GlassSurface />
                  <div className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-3xl font-black leading-[1.15] tracking-tight text-transparent">
                    {statList[1].value}
                  </div>
                  <div className="mt-0.5 text-[11px] uppercase tracking-wider text-white/60">{statList[1].label}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ---------- Stats strip (all stats) — floats over the seam, reflows on mobile ---------- */}
        {statList.length > 0 && (
          <div className="ph-reveal relative isolate mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-3xl sm:grid-cols-4 lg:mt-16">
            <GlassSurface />
            {statList.map((s, i) => (
              <div key={i} className="px-5 py-6 text-center sm:py-8">
                <div className="bg-gradient-to-b from-white to-white/55 bg-clip-text text-3xl font-black leading-[1.15] tracking-tight text-transparent sm:text-4xl">
                  {s.value}
                </div>
                {s.label && <div className="mt-1.5 text-xs text-muted-foreground sm:text-sm">{s.label}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
