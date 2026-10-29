import Link from "next/link";
import type { Metadata } from "next";
import { SiteLayout } from "@/components/public/site-layout";
import { ComicPanelArt } from "@hexapixora/theme-hexa-noir/components/comic-panel-art";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

// Real 404s only: while the API is down the proxy serves the maintenance page
// instead, and pages throw rather than calling notFound() on a failed fetch.
export default function NotFound() {
  return (
    <SiteLayout showHeader showFooter>
      <section className="flex flex-1 items-center justify-center px-4 py-24">
        <div className="w-full max-w-xl border-[3px] border-[#def0fb] bg-[#1b2587] px-6 py-10 text-center shadow-[6px_6px_0_#ffd23f]">
          <ComicPanelArt className="mx-auto mb-6 h-auto w-full max-w-[280px]" />
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#ffd23f]">Error 404</p>
          <h1 className="mb-3 text-3xl font-black leading-tight text-[#def0fb] sm:text-4xl">
            This panel never made it to print
          </h1>
          <p className="mb-8 text-[#a9b4d8]">The page you&rsquo;re looking for moved or doesn&rsquo;t exist.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="border-2 border-[#def0fb] bg-[#ffd23f] px-5 py-2.5 font-bold text-[#0b0f2e] shadow-[4px_4px_0_#def0fb] transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#def0fb]"
            >
              Back to home
            </Link>
            <Link
              href="/insights"
              className="border-2 border-[#def0fb] px-5 py-2.5 font-bold text-[#def0fb] transition-colors hover:bg-[#def0fb]/10"
            >
              Read insights
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
