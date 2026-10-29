"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
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
        <div className="fixed inset-x-0 bottom-0 z-[70] px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-2xl border border-white/12 bg-[#0e0e12]/90 p-5 shadow-[0_24px_70px_-24px_rgba(0,0,0,0.8)] ring-1 ring-inset ring-white/10 backdrop-blur-xl sm:flex-row sm:items-center sm:gap-6 sm:p-6">
            <p className="flex-1 text-sm leading-relaxed text-white/75">
              We use cookies to analyse traffic and improve your experience. You can accept or reject
              analytics cookies — see our{" "}
              <Link
                href="/privacy-policy"
                className="font-medium text-[#7cc4ff] underline-offset-2 hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </p>
            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() => choose("rejected")}
                className="rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => choose("accepted")}
                className="rounded-full bg-gradient-to-b from-[#2a9dff] to-[#1074e0] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_26px_-10px_rgba(16,147,253,0.8)] transition-transform hover:-translate-y-0.5"
              >
                Accept all
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
