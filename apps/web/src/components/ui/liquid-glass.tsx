import React from "react";

/**
 * Layered "liquid glass" light overlay (iOS-26 style). Render it as the LAST
 * children inside a `relative overflow-hidden` container placed over an image —
 * it layers light, a diagonal specular, a slow moving reflection and inner
 * depth WITHOUT blurring the image (the photo stays sharp).
 *
 * The container sets its own border-radius; the inner-shadow layer inherits it.
 * Keep any real content (captions, overlays) AFTER this so it paints on top and
 * stays crisp on mobile (these layers use no backdrop-filter).
 */
export function LiquidGlass({
  tintClass = "to-primary-blue/60",
}: {
  /** Tailwind gradient end-color for the bottom tint. Pass a literal so Tailwind
   *  detects it, e.g. "to-primary-blue/60", "to-primary-blue/40" or "to-white/0". */
  tintClass?: string;
}) {
  return (
    <>
      {/* a) Vertical light: white sheen up top → clear middle → brand tint easing
             into ONLY the bottom ~28% (the glass itself tints; no panel). */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 bg-gradient-to-b from-white/12 via-white/0 via-72% ${tintClass}`}
      />
      {/* b) Static diagonal specular — light glancing off polished glass. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(118deg,transparent_34%,rgba(255,255,255,0.10)_44%,rgba(255,255,255,0.22)_49%,rgba(255,255,255,0.06)_55%,transparent_66%)]"
      />
      {/* c) Slow animated reflection sweep — elegant, barely noticeable
             (GPU transform+opacity; disabled under prefers-reduced-motion). */}
      <div
        aria-hidden
        className="glass-sheen pointer-events-none absolute -inset-y-1/4 -left-1/3 w-1/3 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)] [animation:glassSheen_7s_ease-in-out_infinite]"
      />
      {/* d) Inner highlights + inner shadow for depth (thin top light line, faint
             full-edge glow, soft dark base). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_0_0_1px_rgba(255,255,255,0.06),inset_0_-26px_44px_-26px_rgba(0,0,0,0.55)]"
      />
    </>
  );
}
