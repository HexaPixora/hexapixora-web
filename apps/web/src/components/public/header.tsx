"use client";

import React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const { navId, logoUrl, ctaText, ctaUrl, ctaStyle, isSticky, glassmorphism } = headerSchema.parse(config || DEFAULT_HEADER_CONFIG);

  // Resolve the selected navigation
  const selectedNav = navigations.find(n => n.id === navId);
  const menuItems = selectedNav?.items || [];

  const finalLogoUrl = logoUrl || settings?.logoUrl;
  const siteName = settings?.siteName || "HexaPixora";

  // Active-route highlighting. A link is active on an exact match or when the
  // current path is nested under it (e.g. /blog/foo highlights /blog). A parent
  // with children is active if it — or any of its children — matches.
  const pathname = usePathname();
  const isLinkActive = (url?: string) =>
    !!url && url !== "#" && (pathname === url || (url !== "/" && pathname.startsWith(url + "/")));
  const isItemActive = (item: MenuItem) =>
    isLinkActive(item.url) || (item.children?.some((c) => isLinkActive(c.url)) ?? false);

  // Glass "bubble" highlight: a translucent rounded pill that fades in on
  // hover/focus and stays for the active page. Reads on the glass header (which
  // already blurs the page behind it) and doesn't depend on the primary color
  // (which equals foreground in the dark theme).
  const bubbleBase = "rounded-full px-3 py-2 outline-none transition-colors duration-300";
  const bubbleState = (active: boolean) =>
    active
      ? "bg-foreground/15 font-semibold"
      : "hover:bg-foreground/10 focus-visible:bg-foreground/10";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  // Search open state lives here so the header can hide the CTA and let the
  // search field expand into its place at the right edge.
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  // Which parent items are expanded in the mobile accordion.
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({});
  // The drawer is portaled to <body>; only render it after mount (client) so it
  // escapes the header's `backdrop-blur` containing block — otherwise a
  // `position: fixed` descendant is clipped to the 64px header, not the viewport.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // Focus management for the mobile drawer: move focus in on open, trap Tab
  // inside, and restore focus to the toggle on close.
  const menuToggleRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  const closeMenu = React.useCallback(() => {
    setIsMobileMenuOpen(false);
    setOpenGroups({});
  }, []);

  const toggleGroup = (id: string) =>
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  // While the mobile menu is open: lock body scroll, close on Escape, move
  // focus into the drawer and trap Tab inside it, then restore focus on close.
  React.useEffect(() => {
    if (!isMobileMenuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((el) => el.offsetParent !== null);

    // Move focus into the drawer once it's mounted/painted.
    const focusTimer = setTimeout(() => focusables()[0]?.focus(), 60);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      // Restore focus to the toggle that opened the drawer.
      menuToggleRef.current?.focus();
    };
  }, [isMobileMenuOpen, closeMenu]);

  return (
    <>
      {/* Frosted top canopy — a full-width glass strip fixed at the very top,
          spanning the status-bar/notch area AND the header zone, sitting BEHIND
          the floating pill (z below the header). Content scrolls behind it and
          blurs, so the status bar + header stay legible over moving content.
          Fades out at its lower edge (mask) so there's no hard line. Mobile only —
          desktop keeps the clean floating pill. */}
      <div
        aria-hidden
        className="md:hidden pointer-events-none fixed inset-x-0 top-0 z-40 h-[calc(env(safe-area-inset-top)+1rem)] backdrop-blur-lg [mask-image:linear-gradient(to_bottom,black,black,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,black,black,transparent)]"
      />
      <header className={`w-full md:px-0 px-2 z-50 ${isSticky ? "sticky top-[calc(env(safe-area-inset-top)+1rem)]" : ""} transition-all`}>
      <div className={`container relative flex h-16 items-center justify-between rounded-full border ${glassmorphism ? "" : "bg-background"}`}>
        {/* Glass blur lives on its own layer (not the pill) so the dropdown &
            search results — which are DOM descendants — aren't nested inside a
            backdrop-filter ancestor, which would cancel THEIR blur. */}
        {glassmorphism && <div aria-hidden className="absolute inset-0 -z-10 rounded-full backdrop-blur-lg" />}
        {/* Logo + Site Name. On mobile the site-name text hides while search is
            open to free room for the field; the logo mark stays. Always shown from md up. */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          {finalLogoUrl && (
            <img src={finalLogoUrl} alt={siteName} className="h-8 w-auto object-contain" />
          )}
          <span
            className={`font-bold text-xl tracking-tight text-foreground transition-all duration-300 ease-out ${
              isSearchOpen
                ? "opacity-0 -translate-x-2 pointer-events-none md:opacity-100 md:translate-x-0 md:pointer-events-auto"
                : "opacity-100"
            }`}
          >
            {siteName}
          </span>
        </Link>
        
        {/* Desktop Menu */}
        <nav aria-label="Main" className="hidden md:flex items-center gap-1">
          {menuItems.map((item) => (
            <div key={item.id} className="relative group">
              {item.children && item.children.length > 0 ? (
                <>
                  {/* The parent itself is clickable when it has a real link; the
                      dropdown opens on hover AND keyboard focus (group-focus-within).
                      A "#"/empty url stays a non-navigating trigger. The dropdown is
                      a sibling (not nested) so we never put an <a> inside an <a>. */}
                  {item.url && item.url !== "#" ? (
                    <Link
                      href={item.url}
                      target={item.target}
                      aria-haspopup="menu"
                      aria-current={isLinkActive(item.url) ? "page" : undefined}
                      className={`flex items-center gap-1 text-sm font-medium ${bubbleBase} ${bubbleState(isItemActive(item))}`}
                    >
                      {item.label} <ChevronDown size={14} className="group-hover:rotate-180 group-focus-within:rotate-180 transition-transform" />
                    </Link>
                  ) : (
                    <span
                      tabIndex={0}
                      role="button"
                      aria-haspopup="menu"
                      className={`flex items-center gap-1 text-sm font-medium cursor-pointer ${bubbleBase} ${bubbleState(isItemActive(item))}`}
                    >
                      {item.label} <ChevronDown size={14} className="group-hover:rotate-180 group-focus-within:rotate-180 transition-transform" />
                    </span>
                  )}

                  {/* Dropdown — its own floating "part" (matches the header pills),
                      always rendered so it can animate. Opens on hover or focus. */}
                  <div className="absolute top-full left-0 pt-3 opacity-0 -translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto transition-all duration-300 ease-out">
                    <div className="p-2 min-w-[220px] flex flex-col gap-1">
                      {item.children.map((child, ci) => (
                        <Link
                          key={child.id}
                          href={child.url}
                          target={child.target}
                          aria-current={isLinkActive(child.url) ? "page" : undefined}
                          style={{ transitionDelay: `${ci * 150}ms` }}
                          className={`${glassmorphism ? "backdrop-blur-lg" : "bg-background"} border rounded-2xl shadow-xl px-3 py-2.5 text-sm opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 hover:bg-foreground/10 focus-visible:bg-foreground/10 outline-none transition-[opacity,transform] duration-[600ms] ease-out ${isLinkActive(child.url) ? "bg-foreground/15 font-semibold" : ""}`}
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
                  aria-current={isLinkActive(item.url) ? "page" : undefined}
                  className={`inline-flex text-sm font-medium ${bubbleBase} ${bubbleState(isLinkActive(item.url))}`}
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
        
        {/* CTA, Search & Mobile Toggle. The CTA fades out as the search field
            expands leftward into its place at the right edge. */}
        <div className={`flex items-center gap-2 md:gap-4`}>
          {ctaText && (
            <div
              className={`hidden md:block transition-all duration-300 ease-out ${
                isSearchOpen ? "opacity-0 -translate-x-2 pointer-events-none" : "opacity-100"
              }`}
            >
              <Button asChild variant={ctaStyle as any}>
                <Link href={ctaUrl || "/"}>{ctaText}</Link>
              </Button>
            </div>
          )}

          <SearchBar open={isSearchOpen} onOpenChange={setIsSearchOpen} glass={glassmorphism} />

          <button
            ref={menuToggleRef}
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
          inert={!isMobileMenuOpen}
        >
        {/* Backdrop */}
        <div
          onClick={closeMenu}
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100" : "opacity-0"}`}
        />

        {/* Panel */}
        <div
          ref={panelRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={`absolute right-0 top-0 h-full w-[85%] max-w-sm ${glassmorphism ? "bg-background/0 backdrop-blur-lg" : "bg-background"} border-l shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
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
          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
            {menuItems.map((item) =>
              item.children && item.children.length > 0 ? (
                <div key={item.id} className="flex flex-col">
                  {/* Label navigates (when it has a real link); the chevron is a
                      separate button that just expands/collapses the sub-items. */}
                  <div className={`flex items-center justify-between w-full rounded-lg text-base font-semibold hover:bg-muted/60 transition-colors ${isItemActive(item) ? "bg-muted/50 text-foreground" : "text-foreground"}`}>
                    {item.url && item.url !== "#" ? (
                      <Link
                        href={item.url}
                        target={item.target}
                        onClick={closeMenu}
                        aria-current={isLinkActive(item.url) ? "page" : undefined}
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
                            aria-current={isLinkActive(child.url) ? "page" : undefined}
                            className={`px-3 py-2.5 rounded-lg text-sm hover:bg-muted/40 transition-colors ${isLinkActive(child.url) ? "bg-muted/50 text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}
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
                  aria-current={isLinkActive(item.url) ? "page" : undefined}
                  className={`px-3 py-3 rounded-lg text-base font-semibold hover:bg-muted/60 hover:text-primary transition-colors ${isLinkActive(item.url) ? "bg-muted/50 text-foreground" : "text-foreground"}`}
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
    </>
  );
}
