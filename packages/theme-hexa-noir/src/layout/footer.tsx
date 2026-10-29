import type { ReactNode } from "react";
import Link from "next/link";
import { DEFAULT_FOOTER_CONFIG, footerSchema } from "@hexapixora/contracts/layout/footer";
import { DEFAULT_HEADER_CONFIG, headerSchema } from "@hexapixora/contracts/layout/header";
import { safeHref } from "@hexapixora/contracts/links";
import { CookiePreferencesButton } from "../components/cookie-preferences-button";
import { NavLink } from "../components/nav-link";
import { findNavItems, settingText, type MenuItem, type SiteShellData } from "./nav-types";

const LINK_CLASS = "transition-colors duration-300 hover:text-signal";

function LinkColumn({ title, items }: { title: string; items: MenuItem[] }) {
  if (items.length === 0) return null;
  return (
    <nav aria-label={title || undefined}>
      {title ? <h2 className="mono mb-5 text-copy-dim">{title}</h2> : null}
      <ul className="grid gap-2.5 font-semibold">
        {items.map((item) => (
          <li key={item.id}>
            <NavLink href={item.url} newTab={item.target === "_blank"} className={LINK_CLASS}>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Footer: brand and tagline, two link columns from the CMS, social links and
 * an optional newsletter form passed in by the app (forms post through the
 * app's SDK, which a theme never imports).
 */
export function Footer({ data, newsletter }: { data: SiteShellData; newsletter?: ReactNode }) {
  const parsed = footerSchema.safeParse(data.footerConfig ?? DEFAULT_FOOTER_CONFIG);
  const config = parsed.success ? parsed.data : DEFAULT_FOOTER_CONFIG;
  const header = headerSchema.safeParse(data.headerConfig ?? DEFAULT_HEADER_CONFIG);
  const headerLogo = header.success ? header.data.logoUrl : undefined;

  const siteName = settingText(data.settings, "siteName") || "HexaPixora";
  const logoUrl = safeHref(config.logoUrl || headerLogo || settingText(data.settings, "logoUrl"));
  const socials = (config.socials ?? []).filter((social) => social.platform && safeHref(social.url));
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-20 text-copy">
      <div className="page-width">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
          <div className="grid content-start gap-5">
            <Link href="/" className="flex items-center gap-2.5 font-display text-[22px] font-light tracking-[0.06em]">
              {logoUrl ? (
                <img src={logoUrl} alt="" width={30} height={30} decoding="async" className="h-[30px] w-[30px] object-contain" />
              ) : null}
              <span className="uppercase">{siteName}</span>
            </Link>
            {config.tagline ? <p className="max-w-[34ch] text-copy-dim">{config.tagline}</p> : null}
            {socials.length > 0 ? (
              <ul aria-label="Social links" className="mono flex flex-wrap gap-x-5 gap-y-2">
                {socials.map((social) => (
                  <li key={social.platform}>
                    <NavLink href={social.url} className={LINK_CLASS}>
                      {social.platform}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <LinkColumn title={config.col1Title ?? ""} items={findNavItems(data.navigations, config.col1NavId)} />
          <LinkColumn title={config.col2Title ?? ""} items={findNavItems(data.navigations, config.col2NavId)} />

          {config.showNewsletter && newsletter ? (
            <div className="grid content-start gap-4">
              <h2 className="mono text-copy-dim">Newsletter</h2>
              {newsletter}
            </div>
          ) : null}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-line pt-6 text-sm text-copy-dim md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {siteName}
            {settingText(data.settings, "tagline") ? ` · ${settingText(data.settings, "tagline")}` : ""}
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li>
              <Link href="/privacy-policy" className={LINK_CLASS}>
                Privacy policy
              </Link>
            </li>
            <li>
              <Link href="/terms-of-service" className={LINK_CLASS}>
                Terms of service
              </Link>
            </li>
            <li>
              <CookiePreferencesButton className={LINK_CLASS} />
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
