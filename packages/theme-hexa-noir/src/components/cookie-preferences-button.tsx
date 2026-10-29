"use client";

/** Re-opens the app's cookie banner, which listens for the `cookie:open` event. */
export function CookiePreferencesButton({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event("cookie:open"))}>
      Cookie preferences
    </button>
  );
}
