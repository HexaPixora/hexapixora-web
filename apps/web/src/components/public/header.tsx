"use client";

import React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X, ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/public/search-bar";
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
  // Which parent items are expanded in the mobile accordion.
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({});
  // The drawer is portaled to <body>; only render it after mount (client) so it
  // escapes the header's `backdrop-blur` containing block — otherwise a
  // `position: fixed` descendant is clipped to the 64px header, not the viewport.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const closeMenu = React.useCallback(() => {
    setIsMobileMenuOpen(false);
    setOpenGroups({});
  }, []);

  const toggleGroup = (id: string) =>
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  // Lock body scroll and close on Escape while the mobile menu is open.
  React.useEffect(() => {
    if (!isMobileMenuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isMobileMenuOpen, closeMenu]);

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
                <>
                  {/* The parent itself is clickable when it has a real link; the
                      dropdown still opens on hover. A "#"/empty url stays a
                      non-navigating trigger. The dropdown is a sibling (not
                      nested) so we never put an <a> inside an <a>. */}
                  {item.url && item.url !== "#" ? (
                    <Link
                      href={item.url}
                      target={item.target}
                      className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors py-2"
                    >
                      {item.label} <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" />
                    </Link>
                  ) : (
                    <span className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors cursor-pointer py-2">
                      {item.label} <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" />
                    </span>
                  )}

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
                </>
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
        
        {/* Search, CTA & Mobile Toggle */}
        <div className="flex items-center gap-2 md:gap-4">
          <SearchBar />
          {ctaText && (
            <Button asChild variant={ctaStyle as any} className="hidden md:inline-flex">
              <Link href={ctaUrl || "/"}>{ctaText}</Link>
            </Button>
          )}
          
          <button
            className="md:hidden relative h-10 w-10 inline-flex items-center justify-center rounded-lg text-foreground hover:bg-muted/60 active:scale-95 transition-all"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {/* Cross-fade between hamburger and close icon */}
            <Menu
              size={24}
              className={`absolute transition-all duration-300 ${isMobileMenuOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"}`}
            />
            <X
              size={24}
              className={`absolute transition-all duration-300 ${isMobileMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"}`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu — slide-in drawer, portaled to <body> so `fixed` is
          relative to the viewport (not the blurred header). Kept mounted for
          enter/exit animation. */}
      {mounted && createPortal(
        <div
          className={`md:hidden fixed inset-0 z-[60] ${isMobileMenuOpen ? "" : "pointer-events-none"}`}
          aria-hidden={!isMobileMenuOpen}
        >
        {/* Backdrop */}
        <div
          onClick={closeMenu}
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100" : "opacity-0"}`}
        />

        {/* Panel */}
        <div
          id="mobile-menu"
          className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-background border-l shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between h-16 px-5 border-b flex-shrink-0">
            <Link href="/" onClick={closeMenu} className="flex items-center gap-2">
              {finalLogoUrl && (
                <img src={finalLogoUrl} alt={siteName} className="h-7 w-auto object-contain" />
              )}
              <span className="font-bold text-lg tracking-tight text-foreground">{siteName}</span>
            </Link>
            <button
              onClick={closeMenu}
              aria-label="Close menu"
              className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
            {menuItems.map((item) =>
              item.children && item.children.length > 0 ? (
                <div key={item.id} className="flex flex-col">
                  {/* Label navigates (when it has a real link); the chevron is a
                      separate button that just expands/collapses the sub-items. */}
                  <div className="flex items-center justify-between w-full rounded-lg text-base font-semibold text-foreground hover:bg-muted/60 transition-colors">
                    {item.url && item.url !== "#" ? (
                      <Link
                        href={item.url}
                        target={item.target}
                        onClick={closeMenu}
                        className="flex-1 px-3 py-3 text-left"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <button
                        onClick={() => toggleGroup(item.id)}
                        className="flex-1 px-3 py-3 text-left"
                      >
                        {item.label}
                      </button>
                    )}
                    <button
                      onClick={() => toggleGroup(item.id)}
                      aria-expanded={!!openGroups[item.id]}
                      aria-label={`Toggle ${item.label} submenu`}
                      className="px-3 py-3 self-stretch flex items-center"
                    >
                      <ChevronDown
                        size={18}
                        className={`text-muted-foreground transition-transform duration-300 ${openGroups[item.id] ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>
                  <div
                    className={`grid transition-all duration-300 ease-out ${openGroups[item.id] ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                  >
                    <div className="overflow-hidden">
                      <div className="ml-3 pl-3 my-1 border-l flex flex-col">
                        {item.children.map((child) => (
                          <Link
                            key={child.id}
                            href={child.url}
                            target={child.target}
                            onClick={closeMenu}
                            className="px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.id}
                  href={item.url}
                  target={item.target}
                  onClick={closeMenu}
                  className="px-3 py-3 rounded-lg text-base font-semibold text-foreground hover:bg-muted/60 hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* CTA pinned to the bottom */}
          {ctaText && (
            <div className="p-4 border-t flex-shrink-0">
              <Button asChild variant={ctaStyle as any} size="lg" className="w-full justify-center gap-2 text-base">
                <Link href={ctaUrl || "/"} onClick={closeMenu}>
                  {ctaText}
                  <ArrowRight size={18} />
                </Link>
              </Button>
            </div>
          )}
        </div>
        </div>,
        document.body
      )}
    </header>
  );
}
