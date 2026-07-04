"use client";

import React from "react";
import Link from "next/link";
import { footerSchema, DEFAULT_FOOTER_CONFIG } from "@/lib/module-schemas/footer-schema";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SocialIcon } from "@/components/icons/social-icons";

interface MenuItem {
  id: string;
  label: string;
  url: string;
  target: "_self" | "_blank";
  children: MenuItem[];
}

interface Navigation {
  id: string;
  name: string;
  items: MenuItem[];
}

interface FooterProps {
  settings: any;
  config: any;
  headerConfig?: any;
  navigations: Navigation[];
}

export default function PublicFooter({ settings, config, headerConfig, navigations }: FooterProps) {
  // Parse config with zod to ensure safe fallbacks
  const footerConfig = footerSchema.parse(config || DEFAULT_FOOTER_CONFIG);
  const {
    logoUrl, tagline, col1NavId, col1Title, col2NavId, col2Title,
    socials, showNewsletter
  } = footerConfig;

  // Resolve Navigations
  const col1Nav = navigations.find(n => n.id === col1NavId)?.items || [];
  const col2Nav = navigations.find(n => n.id === col2NavId)?.items || [];

  const finalLogoUrl = logoUrl || headerConfig?.logoUrl || settings?.logoUrl;
  const siteName = settings?.siteName || "HexaPixora";
  const currentYear = new Date().getFullYear();
  const ctaUrl = headerConfig?.ctaUrl || "/contact";

  // Glass "bubble" link hover, matching the header nav.
  const linkClass =
    "inline-block rounded-md px-2 py-1 -mx-2 text-sm opacity-70 hover:opacity-100 hover:bg-foreground/10 transition-colors";
  // Base glass bento tile: frosted card that lifts on hover, matching the header.
  const cardClass =
    "group relative rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-6 transition-all duration-300 hover:border-foreground/25 hover:bg-foreground/[0.06]";

  return (
    <footer className={`pt-8 `}>
      <div className="container pt-16 pb-[calc(4rem+env(safe-area-inset-bottom))] relative isolate overflow-hidden text-foreground">
        {/* Glass blur on its own layer (not the container) so descendant content
            — logo, text — isn't inside a backdrop-filter element, which renders
            children blurry on mobile WebKit. */}
        <div aria-hidden className="absolute inset-0 -z-10 backdrop-blur-lg" />
        {/* Soft brand-blue aurora for depth. */}
        <div aria-hidden className="pointer-events-none absolute top-42 right-42 -z-10 h-42 w-42 rounded-full bg-primary-blue/100 blur-3xl " />

        {/* Bento grid of glass tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Brand */}
          <div className={`${cardClass} sm:col-span-2 flex flex-col justify-between gap-8`}>
            <div className="space-y-4">
              <Link href="/" className="inline-block">
                {finalLogoUrl ? (
                  <img src={finalLogoUrl} alt={siteName} className="h-10 w-auto" />
                ) : (
                  <span className="font-extrabold text-2xl tracking-tight">{siteName}</span>
                )}
              </Link>
              {tagline && <p className="opacity-70 text-sm leading-relaxed max-w-sm">{tagline}</p>}
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-50">Pixels meet logic</p>
          </div>

          {/* Quick Links */}
          <nav aria-label={col1Title} className={cardClass}>
            <h4 className="font-semibold text-[11px] uppercase tracking-widest opacity-60 mb-4">{col1Title}</h4>
            <ul className="space-y-1">
              {col1Nav.map((link) => (
                <li key={link.id}>
                  <Link href={link.url} target={link.target} className={linkClass}>{link.label}</Link>
                </li>
              ))}
              {col1Nav.length === 0 && <li className="text-sm opacity-40 italic">No links</li>}
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label={col2Title} className={cardClass}>
            <h4 className="font-semibold text-[11px] uppercase tracking-widest opacity-60 mb-4">{col2Title}</h4>
            <ul className="space-y-1">
              {col2Nav.map((link) => (
                <li key={link.id}>
                  <Link href={link.url} target={link.target} className={linkClass}>{link.label}</Link>
                </li>
              ))}
              {col2Nav.length === 0 && <li className="text-sm opacity-40 italic">No links</li>}
            </ul>
          </nav>

          {/* Newsletter */}
          {showNewsletter && (
            <div className={`${cardClass} sm:col-span-2 flex flex-col justify-center`}>
              <h4 className="font-semibold text-lg mb-1">Stay in the loop</h4>
              <p className="text-sm opacity-70 mb-4">Occasional insights on design & engineering. No spam, ever.</p>
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <Input type="email" placeholder="you@email.com" className="flex-1 bg-foreground/5 border-foreground/15" />
                <Button type="submit">Subscribe</Button>
              </form>
            </div>
          )}

          {/* Connect / socials */}
          <div className={`${cardClass} sm:col-span-2 ${showNewsletter ? "" : "lg:col-span-4"} flex flex-col justify-center`}>
            <h4 className="font-semibold text-lg mb-4">Let&apos;s connect</h4>
            <div className="flex flex-wrap items-center gap-3">
              {(socials || []).map((social, idx) =>
                social.url ? (
                  <a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={social.platform}
                    style={social.color ? { color: social.color } : undefined}
                    className="grid h-11 w-11 place-items-center rounded-xl border border-foreground/10 bg-foreground/[0.03] opacity-80 hover:opacity-100 hover:border-foreground/25 hover:-translate-y-1 transition-all"
                  >
                    <SocialIcon name={social.icon} size={20} />
                  </a>
                ) : null
              )}
            </div>
          </div>

          {/* CTA — the statement tile */}
          <Link
            href={ctaUrl}
            className={`${cardClass} sm:col-span-2 lg:col-span-4 overflow-hidden flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-8`}
          >
            <div>
              <p className="text-[11px] uppercase tracking-widest opacity-60 mb-2">Have a project in mind?</p>
              <span className="block text-2xl md:text-4xl font-bold tracking-tight">Let&apos;s build something great.</span>
            </div>
            <span className="inline-flex items-center gap-2 text-lg font-semibold whitespace-nowrap">
              Start a project
              <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1.5" />
            </span>
            <div aria-hidden className="pointer-events-none absolute -bottom-16 -right-8 h-56 w-56 rounded-full bg-[#1093FD]/15 blur-3xl" />
          </Link>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm opacity-60">
            &copy; {currentYear} {siteName}. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm opacity-60">
            <Link href="/privacy" className="rounded-md px-2 py-1 hover:opacity-100 hover:bg-foreground/10 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="rounded-md px-2 py-1 hover:opacity-100 hover:bg-foreground/10 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
