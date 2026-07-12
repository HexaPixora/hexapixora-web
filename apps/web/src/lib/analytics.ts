/**
 * Fires an analytics event to whichever tags are active (configured in
 * Admin → Settings → Tracking). Sends to GA4 via gtag.js and also pushes to the
 * GTM dataLayer, so either tool can act on it. Safe no-op on the server or when
 * no tag is loaded.
 *
 * Recommended event names in use: `generate_lead` (GA4 official), plus the
 * custom `newsletter_signup` and `book_call`. Mark these as Key Events in
 * GA4 → Admin → Key events to count them as conversions.
 */
type EventParams = Record<string, string | number | boolean | null | undefined>;

export function trackEvent(name: string, params: EventParams = {}): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  };
  // GA4 (direct gtag.js)
  w.gtag?.("event", name, params);
  // GTM dataLayer — available for custom triggers / future tags
  if (Array.isArray(w.dataLayer)) w.dataLayer.push({ event: name, ...params });
}
