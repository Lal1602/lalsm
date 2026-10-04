import { CONSTELLATIONS } from "./constellations";
import type { SeamKind } from "./SpaceRenderer";

export interface DrawOptions {
  /** Slot size in css px. */
  w: number;
  h: number;
  /** World y (css px from the seam) of the slot's top edge. */
  originY: number;
  kind: SeamKind;
}

/**
 * Paints the constellations that fall inside a slot onto a 2D canvas, once. The
 * result is uploaded as a texture and sampled by the seam shader, so a figure
 * costs one texture read per pixel instead of a distance test per star and line.
 * The artwork is light on transparent; the shader pulses it.
 */
export function drawConstellations(ctx: CanvasRenderingContext2D, { w, h, originY, kind }: DrawOptions) {
  ctx.clearRect(0, 0, w, h);
  const tint = kind === "nebula" ? "206,222,255" : "255,236,190";
  const star = kind === "nebula" ? "238,244,255" : "255,248,226";

  for (const c of CONSTELLATIONS[kind]) {
    const pts = c.stars.map((s) => ({ x: s.x * w, y: s.y - originY, s: s.s }));

    ctx.lineWidth = 1;
    for (const [a, b] of c.lines) {
      const p = pts[a];
      const q = pts[b];
      if (Math.max(p.y, q.y) < -10 || Math.min(p.y, q.y) > h + 10) continue;
      // Hairlines fade toward the stars so they read as connections, not fences.
      const g = ctx.createLinearGradient(p.x, p.y, q.x, q.y);
      g.addColorStop(0, `rgba(${tint},0.10)`);
      g.addColorStop(0.5, `rgba(${tint},0.34)`);
      g.addColorStop(1, `rgba(${tint},0.10)`);
      ctx.strokeStyle = g;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(q.x, q.y);
      ctx.stroke();
    }

    for (const p of pts) {
      if (p.y < -30 || p.y > h + 30) continue;
      const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.s * 7);
      halo.addColorStop(0, `rgba(${star},0.55)`);
      halo.addColorStop(0.4, `rgba(${tint},0.14)`);
      halo.addColorStop(1, `rgba(${tint},0)`);
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.s * 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(${star},0.95)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.s * 0.75, 0, Math.PI * 2);
      ctx.fill();

      // The brightest stars get a cross-shaped flare.
      if (p.s >= 2.3) {
        const reach = p.s * 6.5;
        ctx.strokeStyle = `rgba(${star},0.5)`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(p.x - reach, p.y);
        ctx.lineTo(p.x + reach, p.y);
        ctx.moveTo(p.x, p.y - reach);
        ctx.lineTo(p.x, p.y + reach);
        ctx.stroke();
      }
    }
  }
}
