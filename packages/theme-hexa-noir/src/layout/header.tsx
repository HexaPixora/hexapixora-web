import Link from "next/link";
import { DEFAULT_HEADER_CONFIG, headerSchema } from "@hexapixora/contracts/layout/header";
import { safeHref } from "@hexapixora/contracts/links";
import { HideOnScrollHeader } from "@hexapixora/motion/hide-on-scroll-header";
import { NavLink } from "../components/nav-link";
import { DesktopNav } from "./desktop-nav";
import { MenuDialog } from "./menu-dialog";
import { findNavItems, settingText, type SiteShellData } from "./nav-types";

/**
 * Fixed header: main links (wide screens), the brand in the centre, and the
 * call to action plus the full menu on the right. It hides while scrolling
 * down and returns, with a glass background, on the way up.
 */
export function Header({ data }: { data: SiteShellData }) {
  const parsed = headerSchema.safeParse(data.headerConfig ?? DEFAULT_HEADER_CONFIG);
  const config = parsed.success ? parsed.data : DEFAULT_HEADER_CONFIG;
  const items = findNavItems(data.navigations, config.navId);
  const siteName = settingText(data.settings, "siteName") || "HexaPixora";
  const logoUrl = safeHref(config.logoUrl || settingText(data.settings, "logoUrl"));
  const ctaText = config.ctaText ?? "";
  const ctaUrl = config.ctaUrl ?? "/contact-us";

  return (
    <HideOnScrollHeader part="site-header" className="fixed inset-x-0 top-0 z-40 border-b border-transparent pt-[env(safe-area-inset-top)] transition-[transform,background-color,border-color] duration-500 ease-cut data-[away]:-translate-y-full data-[solid]:border-line data-[solid]:bg-page/80 data-[solid]:backdrop-blur-md">
      <div className="page-width grid h-[var(--header-h)] grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="min-w-0">
          <DesktopNav items={items} />
        </div>

        <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-light tracking-[0.06em] sm:text-[22px]">
          {logoUrl ? (
            // Decorative next to the name; sized up front so it never shifts layout.
            <img src={logoUrl} alt="" width={30} height={30} decoding="async" className="h-[30px] w-[30px] object-contain" />
          ) : null}
          <span className="uppercase">{siteName}</span>
        </Link>

        <div className="flex items-center justify-end gap-5">
          {ctaText ? (
            <NavLink href={ctaUrl} className="mono hidden transition-colors duration-300 hover:text-signal sm:inline">
              {ctaText}
            </NavLink>
          ) : null}
          <MenuDialog items={items} ctaText={ctaText} ctaUrl={ctaUrl} />
        </div>
      </div>
    </HideOnScrollHeader>
  );
}
