"use client";

import React from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { headerSchema, DEFAULT_HEADER_CONFIG } from "@/lib/module-schemas/header-schema";

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

interface HeaderProps {
  settings: any;
  config: any;
  navigations: Navigation[];
}

export default function PublicHeader({ settings, config, navigations }: HeaderProps) {
  // Parse config with zod to ensure safe fallbacks
  const { navId, logoUrl, layoutStyle, ctaText, ctaUrl, ctaStyle, isSticky, glassmorphism } = headerSchema.parse(config || DEFAULT_HEADER_CONFIG);

  // Resolve the selected navigation
  const selectedNav = navigations.find(n => n.id === navId);
  const menuItems = selectedNav?.items || [];

  const finalLogoUrl = logoUrl || settings?.logoUrl;
  const siteName = settings?.siteName || "HexaPixora";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className={`w-full border-b z-50 transition-all ${isSticky ? "sticky top-0" : ""} ${glassmorphism ? "bg-background/80 backdrop-blur-md" : "bg-background"}`}>
      <div className={`container flex h-16 items-center ${layoutStyle === "split" ? "justify-between" : "justify-between"}`}>
        
        {/* Logo + Site Name */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          {finalLogoUrl && (
            <img src={finalLogoUrl} alt={siteName} className="h-8 w-auto object-contain" />
          )}
          <span className="font-bold text-xl tracking-tight text-foreground">{siteName}</span>
        </Link>
        
        {/* Desktop Menu */}
        <nav className={`hidden md:flex items-center gap-6 ${layoutStyle === "split" ? "absolute left-1/2 -translate-x-1/2" : ""}`}>
          {menuItems.map((item) => (
            <div key={item.id} className="relative group">
              {item.children && item.children.length > 0 ? (
                <div className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors cursor-pointer py-2">
                  {item.label} <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" />
                  
                  {/* Dropdown */}
                  <div className="absolute top-full left-0 hidden group-hover:block pt-2">
                    <div className="bg-background border rounded-md shadow-lg p-2 min-w-[200px] flex flex-col gap-1">
                      {item.children.map(child => (
                        <Link 
                          key={child.id} 
                          href={child.url} 
                          target={child.target}
                          className="px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link 
                  href={item.url} 
                  target={item.target}
                  className="text-sm font-medium hover:text-primary transition-colors py-2 block"
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
        
        {/* CTA & Mobile Toggle */}
        <div className="flex items-center gap-4">
          {ctaText && (
            <Button asChild variant={ctaStyle as any} className="hidden md:inline-flex">
              <Link href={ctaUrl || "/"}>{ctaText}</Link>
            </Button>
          )}
          
          <button className="md:hidden p-1 text-foreground" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 flex flex-col gap-4">
            {menuItems.map((item) => (
              <div key={item.id} className="flex flex-col">
                {item.children && item.children.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-bold text-foreground">{item.label}</span>
                    <div className="pl-4 flex flex-col gap-2 border-l ml-1">
                      {item.children.map(child => (
                        <Link 
                          key={child.id} 
                          href={child.url} 
                          target={child.target}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link 
                    href={item.url} 
                    target={item.target}
                    className="text-sm font-bold hover:text-primary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            
            {ctaText && (
              <div className="pt-4 border-t mt-2">
                <Button asChild variant={ctaStyle as any} className="w-full">
                  <Link href={ctaUrl || "/"} onClick={() => setIsMobileMenuOpen(false)}>{ctaText}</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
