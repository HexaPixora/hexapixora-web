"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion, whenIdle } from "./load-gsap";

export type FilmLook = {
  /** Light colour as 6-digit hex (#rrggbb); alpha is appended per layer. */
  light: string;
  /** Base colour filling the frame. */
  shade: string;
  /** Streak angle in radians. */
  angle: number;
};

const FRAME_MS = 1000 / 30;

/**
 * Generated "footage": soft glows and light streaks drifting through haze.
 * Decorative only (aria-hidden). Drawn at half resolution and 30 fps, only
 * while on screen, starting once the page is idle; reduced motion gets one
 * still frame. Until the first frame the shade colour fills the box.
 */
export function FilmCanvas({ look, seed = 0, className }: { look: FilmLook; seed?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = prefersReducedMotion();
    const s = seed * 13.7;
    let visible = false;
    let started = false;
    let frame = 0;
    let last = -Infinity;

    const draw = (t: number) => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = look.shade;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 6; i++) {
        const x = (Math.sin(t * 0.00015 * (i + 1) + s + i) * 0.5 + 0.5) * w;
        const y = (Math.cos(t * 0.0001 * (i + 2) + s * i) * 0.5 + 0.5) * h;
        const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(w, h) * (0.25 + i * 0.05));
        g.addColorStop(0, look.light + (i ? "55" : "aa"));
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(look.angle);
      for (let k = 0; k < 14; k++) {
        const off = ((t * 0.02 * (1 + (k % 3)) + k * 97 + s * 50) % (w * 2)) - w;
        const lg = ctx.createLinearGradient(off - 120, 0, off + 120, 0);
        lg.addColorStop(0, "transparent");
        lg.addColorStop(0.5, look.light + "66");
        lg.addColorStop(1, "transparent");
        ctx.fillStyle = lg;
        ctx.fillRect(off - 120, -h + k * (h / 7), 240, 2 + (k % 3));
      }
      ctx.restore();
    };

    const tick = (t: number) => {
      frame = 0;
      if (!visible) return;
      if (t - last >= FRAME_MS) {
        last = t;
        draw(t);
      }
      frame = requestAnimationFrame(tick);
    };

    const play = () => {
      if (!started || !visible) return;
      if (reduce) draw(0);
      else if (!frame) frame = requestAnimationFrame(tick);
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * 0.5));
      canvas.height = Math.max(1, Math.round(r.height * 0.5));
      if (started) draw(reduce ? 0 : performance.now());
    };

    const ro = new ResizeObserver(resize);
    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      play();
    });
    const cancelIdle = whenIdle(() => {
      started = true;
      play();
    });
    ro.observe(canvas);
    io.observe(canvas);

    return () => {
      cancelIdle();
      ro.disconnect();
      io.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [look, seed]);

  return (
    <canvas ref={ref} aria-hidden="true" className={className} style={{ backgroundColor: look.shade, display: "block" }} />
  );
}
