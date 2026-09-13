"use client";
import { memo, useEffect, useRef } from "react";

/**
 * CosmicBackdrop — the deep-space plate the Projects archive floats on.
 *
 * Three deliberate perf choices, because this section is GPU-bound long before
 * it is JS-bound:
 *
 *  1. The nebulae are plain stacked radial-gradients on a single element. No
 *     `filter: blur()` anywhere — a gradient is already soft, and a blurred
 *     full-bleed layer costs an extra render pass on every composite.
 *  2. The starfield is painted to a 2D canvas exactly once per resize. Stars
 *     do not move in the reference art, so there is no rAF loop here at all.
 *  3. The only animated pieces are a dozen ember sprites driven by CSS
 *     keyframes over `transform`/`opacity`, which stay on the compositor.
 */

/** Deterministic PRNG — the sky must be byte-identical on every reload. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Built at module scope so server and client markup agree exactly. */
const EMBERS = (() => {
  const rand = mulberry32(9137);
  return Array.from({ length: 14 }, (_, i) => ({
    key: i,
    left: 3 + rand() * 94,
    top: 8 + rand() * 84,
    delay: -(rand() * 22).toFixed(2),
    duration: (15 + rand() * 18).toFixed(2),
    drift: Math.round((rand() - 0.5) * 120),
    rise: Math.round(-40 - rand() * 90),
    size: (1.4 + rand() * 2.4).toFixed(2),
    warm: rand() > 0.4,
  }));
})();

/** Relativistic shooting cosmic dust streaks with motion blur trails */
const STREAKS = (() => {
  const rand = mulberry32(8492);
  return Array.from({ length: 18 }, (_, i) => ({
    key: i,
    left: -10 + rand() * 110,
    top: 12 + rand() * 80,
    width: Math.round(70 + rand() * 170),
    delay: -(rand() * 8).toFixed(2),
    duration: (3.2 + rand() * 4.8).toFixed(2),
    isWarm: rand() > 0.45,
    tilt: ((rand() - 0.5) * 6).toFixed(1),
  }));
})();

function CosmicBackdrop() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    let last = { w: 0, h: 0 };
    let frame = 0;

    const paint = () => {
      frame = 0;
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (w < 2 || h < 2) return;
      // Sub-pixel resize noise (scrollbars, address-bar collapse) would
      // otherwise repaint 500 stars for nothing.
      if (Math.abs(w - last.w) < 3 && Math.abs(h - last.h) < 3) return;
      last = { w, h };

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const rand = mulberry32(20260910);
      const count = Math.min(560, Math.max(160, Math.round((w * h) / 2400)));

      for (let i = 0; i < count; i++) {
        const x = rand() * w;
        const y = rand() * h;
        const tier = rand();
        const radius = tier > 0.965 ? 1.5 + rand() * 1.0 : 0.32 + rand() * 0.86;
        // Biased low so the field reads as depth rather than confetti.
        const alpha = 0.08 + Math.pow(rand(), 1.9) * 0.86;
        const warm = rand() > 0.82;

        if (radius > 1.4) {
          const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 8);
          glow.addColorStop(0, warm ? `rgba(255,198,138,${alpha * 0.5})` : `rgba(172,208,255,${alpha * 0.42})`);
          glow.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, radius * 8, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = warm ? `rgba(255,222,186,${alpha})` : `rgba(216,232,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    paint();
    const ro = new ResizeObserver(schedule);
    ro.observe(wrap);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="cosmos-backdrop" ref={wrapRef} aria-hidden="true">
      <div className="cosmos-void" />
      <div className="cosmos-nebula" />
      <canvas className="cosmos-starfield" ref={canvasRef} />
      <div className="cosmos-embers">
        {EMBERS.map((e) => (
          <span
            key={e.key}
            className={e.warm ? "cosmos-ember is-warm" : "cosmos-ember"}
            style={
              {
                left: `${e.left}%`,
                top: `${e.top}%`,
                width: `${e.size}px`,
                height: `${e.size}px`,
                animationDelay: `${e.delay}s`,
                animationDuration: `${e.duration}s`,
                "--drift": `${e.drift}px`,
                "--rise": `${e.rise}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <div className="cosmos-streaks" aria-hidden="true">
        {STREAKS.map((s) => (
          <span
            key={s.key}
            className={s.isWarm ? "cosmos-streak is-warm" : "cosmos-streak is-cool"}
            style={
              {
                left: `${s.left}%`,
                top: `${s.top}%`,
                width: `${s.width}px`,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.duration}s`,
                transform: `rotate(${s.tilt}deg)`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <div className="cosmos-vignette" />
    </div>
  );
}

export default memo(CosmicBackdrop);
