"use client";

import React from "react";
import Link from "next/link";
import { footerSchema, DEFAULT_FOOTER_CONFIG } from "@/lib/module-schemas/footer-schema";
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
    socials, backgroundColor, showNewsletter 
  } = footerConfig;

  // Resolve Navigations
  const col1Nav = navigations.find(n => n.id === col1NavId)?.items || [];
  const col2Nav = navigations.find(n => n.id === col2NavId)?.items || [];

  const finalLogoUrl = logoUrl || headerConfig?.logoUrl || settings?.logoUrl;
  const siteName = settings?.siteName || "HexaPixora";
  const currentYear = new Date().getFullYear();

  const bgColorMap = {
    "default": "bg-background border-t text-foreground",
    "muted": "bg-muted text-foreground border-t",
    "dark": "bg-slate-950 text-slate-200"
  };

  const bgClass = bgColorMap[backgroundColor] || bgColorMap["muted"];

  return (
    <footer className={`${bgClass} py-16 md:py-24 transition-colors`}>
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Brand & Tagline */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-block">
              {finalLogoUrl ? (
                <img src={finalLogoUrl} alt={siteName} className="h-10 w-auto" />
              ) : (
                <span className="font-extrabold text-2xl tracking-tight">{siteName}</span>
              )}
            </Link>
            {tagline && (
              <p className="opacity-80 text-sm leading-relaxed max-w-xs">
                {tagline}
              </p>
            )}
            {socials && socials.length > 0 && (
              <div className="flex items-center gap-4 pt-2">
                {socials.map((social, idx) => {
                  const href = social.url;
                  if (!href) return null;
                  return (
                    <a
                      key={idx}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-70 hover:opacity-100 transition-all hover:-translate-y-1"
                      style={social.color ? { color: social.color } : undefined}
                      title={social.platform}
                    >
                      <SocialIcon name={social.icon} size={20} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Navigation Column 1 */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="font-semibold text-sm uppercase tracking-wider">{col1Title}</h4>
            <ul className="space-y-3">
              {col1Nav.map((link) => (
                <li key={link.id}>
                  <Link 
                    href={link.url} 
                    target={link.target}
                    className="text-sm opacity-70 hover:opacity-100 hover:text-primary transition-colors inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {col1Nav.length === 0 && <li className="text-sm opacity-50 italic">No links configured</li>}
            </ul>
          </div>

          {/* Navigation Column 2 */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="font-semibold text-sm uppercase tracking-wider">{col2Title}</h4>
            <ul className="space-y-3">
              {col2Nav.map((link) => (
                <li key={link.id}>
                  <Link 
                    href={link.url} 
                    target={link.target}
                    className="text-sm opacity-70 hover:opacity-100 hover:text-primary transition-colors inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {col2Nav.length === 0 && <li className="text-sm opacity-50 italic">No links configured</li>}
            </ul>
          </div>

          {/* Newsletter */}
          {showNewsletter && (
            <div className="lg:col-span-4 space-y-6">
              <h4 className="font-semibold text-sm uppercase tracking-wider">Stay Updated</h4>
              <p className="text-sm opacity-80 leading-relaxed">
                Subscribe to our newsletter for the latest insights and trends. No spam, ever.
              </p>
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className={`flex-1 ${backgroundColor === "dark" ? "bg-slate-900 border-slate-800 text-white placeholder:text-slate-500" : ""}`}
                />
                <Button type="submit" variant={backgroundColor === "dark" ? "secondary" : "default"}>
                  Subscribe
                </Button>
              </form>
            </div>
          )}

        </div>

        <div className="mt-16 pt-8 border-t border-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm opacity-60">
            &copy; {currentYear} {siteName}. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm opacity-60">
            <Link href="/privacy" className="hover:opacity-100 hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:opacity-100 hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
