"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PILL_CLASS } from "@hexapixora/theme-hexa-noir/components/safe-link";
import { TrackingScripts } from "@/components/seo/tracking-scripts";

const COOKIE_NAME = "hexapixora_cookie_consent";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 6 months, then the banner re-prompts
type Consent = "accepted" | "rejected";

function readConsent(): Consent | null {
  const m = document.cookie.match(/(?:^|;\s*)hexapixora_cookie_consent=([^;]+)/);
  const val = m?.[1];
  return val === "accepted" || val === "rejected" ? val : null;
}

/**
 * GDPR-style cookie consent. Analytics/marketing tags (GA4, GTM, Meta Pixel)
 * load ONLY after the visitor accepts — nothing fires beforehand. The choice is
 * remembered in a first-party cookie (6-month expiry, so it re-prompts); the
 * footer's "Cookie Preferences" link re-opens the banner via a `cookie:open` event.
 */
export function CookieConsent({
  googleAnalyticsId,
  gtmId,
  metaPixelId,
}: {
  googleAnalyticsId?: string | null;
  gtmId?: string | null;
  metaPixelId?: string | null;
}) {
  // undefined = not yet read (SSR/first paint); null = undecided (show banner).
  const [consent, setConsent] = useState<Consent | null | undefined>(undefined);

  useEffect(() => {
    setConsent(readConsent());
    const reopen = () => setConsent(null);
    window.addEventListener("cookie:open", reopen);
    return () => window.removeEventListener("cookie:open", reopen);
  }, []);

  const choose = (value: Consent) => {
    // The consent record is a first-party, strictly-necessary cookie (allowed
    // without consent). The 6-month expiry re-prompts periodically, per guidance.
    document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
    setConsent(value);
  };

  const hasTags = Boolean(googleAnalyticsId?.trim() || gtmId?.trim() || metaPixelId?.trim());
  if (!hasTags) return null;

  return (
    <>
      {consent === "accepted" && (
        <TrackingScripts googleAnalyticsId={googleAnalyticsId} gtmId={gtmId} metaPixelId={metaPixelId} />
      )}

      {consent === null && (
        <section
          aria-label="Cookie choices"
          className="fixed inset-x-0 bottom-0 z-[70] px-gutter pb-[calc(1rem+env(safe-area-inset-bottom))]"
        >
          <div className="mx-auto flex max-w-4xl flex-col gap-5 border border-line bg-page-raised p-6 sm:flex-row sm:items-center sm:gap-8">
            <p className="flex-1 text-sm text-copy-dim">
              <span className="mono mr-2 text-signal">Cookies</span>
              We use cookies to analyse traffic and improve your experience. You can accept or reject analytics cookies.
              See our{" "}
              <Link href="/privacy-policy" className="text-copy underline underline-offset-4 hover:text-signal">
                Privacy Policy
              </Link>
              .
            </p>
            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() => choose("rejected")}
                className={`${PILL_CLASS} border border-copy px-5 py-3 text-sm hover:bg-copy hover:text-page`}
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => choose("accepted")}
                className={`${PILL_CLASS} bg-signal px-5 py-3 text-sm text-on-signal hover:bg-copy hover:text-page`}
              >
                Accept all
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
