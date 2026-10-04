"use client";
import { memo, useEffect, useRef } from "react";
import { mulberry32 } from "@/lib/seededRandom";

const TILE = 768;

/**
 * Deep space behind the Projects section. It used to be 18 CSS-animated streaks,
 * 14 floating embers and a canvas starfield, all moving at once under a plate stage;
 * now it is dark gradients plus a single star tile painted once. Nothing here moves,
 * so it costs nothing after the first paint. The nebula at the section's top edge
 * is the shared seam renderer, not this.
 */
function ProjectsBackdrop() {
  const stars = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stars.current;
    if (!el) return;
    const paint = () => {
    const paper = document.documentElement.getAttribute("data-theme") === "light";
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = TILE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rand = mulberry32(31415);

    // A scatter of grains, a few brighter points with a soft halo.
    for (let i = 0; i < 150; i++) {
      const x = rand() * TILE;
      const y = rand() * TILE;
      const r = 0.35 + rand() * 0.75;
      const warm = rand() > 0.72;
      // On paper the stars are specks of ink, the same scatter.
      ctx.fillStyle = paper
        ? warm ? `rgba(128,65,10,${0.22 + rand() * 0.34})` : `rgba(27,29,51,${0.18 + rand() * 0.36})`
        : warm ? `rgba(255,224,176,${0.25 + rand() * 0.4})` : `rgba(206,226,255,${0.2 + rand() * 0.45})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 16; i++) {
      const x = rand() * TILE;
      const y = rand() * TILE;
      const r = 1 + rand() * 1.1;
      const warm = rand() > 0.6;
      const tint = paper ? (warm ? "128,65,10" : "12,90,121") : warm ? "255,226,180" : "190,220,255";
      const halo = ctx.createRadialGradient(x, y, 0, x, y, r * 7);
      halo.addColorStop(0, `rgba(${tint},${paper ? 0.22 : 0.5})`);
      halo.addColorStop(1, `rgba(${tint},0)`);
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(x, y, r * 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(${tint},0.95)`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    el.style.backgroundImage = `url(${canvas.toDataURL("image/png")})`;
    };
    paint();
    // Repainted when the theme changes (a 768px tile, once).
    const watch = new MutationObserver(paint);
    watch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => watch.disconnect();
  }, []);

  return (
    <div className="cosmos-backdrop" aria-hidden="true">
      <div className="cosmos-void" />
      <div className="cosmos-nebula" />
      <div className="cosmos-stars" ref={stars} />
      <div className="cosmos-vignette" />
    </div>
  );
}

export default memo(ProjectsBackdrop);
