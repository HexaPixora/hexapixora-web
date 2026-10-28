/**
 * Comic panel with speed lines, used on the 404 / error / maintenance screens.
 * Placeholder art: the face in the middle gets replaced by the brand mascot in
 * the theme phase. Mirrors the inline SVG in lib/maintenance-page.ts.
 */
export function ComicPanelArt({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 280 180" role="img" aria-label="A comic panel with speed lines">
      <rect x="4" y="4" width="272" height="172" fill="#0b0f2e" stroke="#def0fb" strokeWidth="3" />
      <g
        className="origin-[140px_90px] motion-safe:animate-[spin_24s_linear_infinite]"
        stroke="#def0fb"
        strokeWidth="2"
        strokeLinecap="round"
        opacity=".55"
      >
        {[
          [140, -60], [290, -20], [330, 90], [290, 200], [140, 240],
          [-10, 200], [-50, 90], [-10, -20], [220, -60], [60, 240],
        ].map(([x, y]) => (
          <line key={`${x}-${y}`} x1="140" y1="90" x2={x} y2={y} />
        ))}
      </g>
      <circle cx="140" cy="90" r="38" fill="#1b2587" stroke="#def0fb" strokeWidth="3" />
      <path d="M124 84 q4 -6 8 0 M148 84 q4 -6 8 0" fill="none" stroke="#def0fb" strokeWidth="3" strokeLinecap="round" />
      <path d="M128 102 q12 10 24 0" fill="none" stroke="#ffd23f" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
