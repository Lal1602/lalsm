"use client";
import React, { memo, useEffect, useRef } from "react";

/**
 * Deterministic PRNG — guarantees the accretion dust wave, telemetry arc,
 * and stardust render identically on every repaint, reload, and across both
 * upper and lower seam halves.
 */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface AccretionHorizonSeamProps {
  /**
   * "upper": Renders inside HorizonShowcase (Creative Playground), height 260px, anchored at bottom: -1px.
   *          Draws virtual coordinate range Y in [0, 260].
   * "lower": Renders inside ProjectsSection (Cosmic Database), height 260px, anchored at top: 0.
   *          Draws virtual coordinate range Y in [260, 520].
   */
  part?: "upper" | "lower";
  className?: string;
}

// Virtual canvas dimensions
const SEAM_Y = 260; // The exact seam boundary where both sections meet
const UPPER_HEIGHT = 260;
const LOWER_HEIGHT = 260;

/**
 * AccretionHorizonSeam — 100% pure procedural code volumetric cosmic accretion wave.
 * Mathematically bridges Creative Playground and Projects with an organic dual-tone
 * cosmic dust flow (Amber-Gold on Left, Celestial Cyan on Right), a glowing curved
 * telemetry horizon arc, and drifting stardust embers.
 */
function AccretionHorizonSeam({ part = "upper", className = "" }: AccretionHorizonSeamProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let lastW = 0;
    let lastH = 0;
    let lastDpr = 0;

    const renderAccretion = () => {
      const w = Math.max(
        window.innerWidth || 0,
        document.documentElement.clientWidth || 0,
        container.clientWidth || 0
      );
      const h = part === "upper" ? UPPER_HEIGHT : LOWER_HEIGHT;
      if (w < 10 || h < 10) return;

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (Math.abs(w - lastW) < 2 && Math.abs(h - lastH) < 2 && lastDpr === dpr) return;
      lastW = w;
      lastH = h;
      lastDpr = dpr;

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = "100%";
      canvas.style.height = `${h}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Virtual Y offset:
      // upper: row 259 corresponds to vcy = 260 -> offsetY = -1
      // lower: row 0 corresponds to vcy = 260 -> offsetY = -260
      const offsetY = part === "upper" ? -(SEAM_Y - UPPER_HEIGHT) - 1 : -SEAM_Y;

      // Deterministic PRNG seed — identical for both upper and lower halves!
      const rand = mulberry32(728194);

      // Helper to draw an oriented radial puff in virtual coordinates
      const drawVirtualPuff = (
        vcx: number,
        vcy: number,
        rx: number,
        ry: number,
        r: number,
        g: number,
        b: number,
        alpha: number
      ) => {
        let finalAlpha = alpha;

        // Quadratic falloff away from the seam (smooth absorption into space)
        if (vcy < 250) {
          const factor = Math.max(0, (vcy - 40) / 210);
          finalAlpha *= factor * factor;
        } else if (vcy > 270) {
          const factor = Math.max(0, (480 - vcy) / 210);
          finalAlpha *= factor * factor;
        }

        if (finalAlpha <= 0.005) return;

        const localY = vcy + offsetY;
        const maxR = Math.max(rx, ry);
        if (localY + maxR < -20 || localY - maxR > h + 20) return;

        ctx.save();
        ctx.translate(vcx, localY);
        ctx.scale(1, ry / rx);

        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${finalAlpha})`);
        grad.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, ${finalAlpha * 0.72})`);
        grad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${finalAlpha * 0.25})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, rx, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      // ── 0. Smooth Atmospheric Seam Foundation Wash ───────────────────
      // Soft atmospheric transition matching the deep cosmic tone across the seam
      const seamWash = ctx.createLinearGradient(0, 260 + offsetY - 70, 0, 260 + offsetY + 70);
      seamWash.addColorStop(0, "rgba(3, 3, 8, 0)");
      seamWash.addColorStop(0.25, "rgba(22, 28, 70, 0.45)");
      seamWash.addColorStop(0.5, "rgba(140, 85, 25, 0.55)");
      seamWash.addColorStop(0.75, "rgba(20, 110, 150, 0.45)");
      seamWash.addColorStop(1, "rgba(3, 3, 8, 0)");
      ctx.fillStyle = seamWash;
      ctx.fillRect(0, 260 + offsetY - 70, w, 140);

      // ── 1. Broad Ambient Cosmic Gas Glows (Centered on Seam Y = 260) ────
      ctx.globalCompositeOperation = "source-over";

      // Far-Left Edge wash: solidly blankets x=0 boundary with deep cobalt & warm bronze
      drawVirtualPuff(0, 260, w * 0.36, 180, 18, 26, 85, 0.65);
      drawVirtualPuff(0, 260, w * 0.28, 160, 175, 95, 25, 0.52);
      drawVirtualPuff(w * 0.04, 260, w * 0.30, 170, 225, 125, 15, 0.50);

      // Left-Center: Warm Solar Amber & Radiant Gold
      drawVirtualPuff(w * 0.18, 260, w * 0.34, 170, 240, 140, 18, 0.52);
      drawVirtualPuff(w * 0.30, 260, w * 0.32, 160, 250, 195, 35, 0.48);
      drawVirtualPuff(w * 0.24, 260, w * 0.26, 150, 185, 110, 30, 0.46);

      // Center: Radiant Gold meets Aqua Mint (Hijau Muda) collision zone
      drawVirtualPuff(w * 0.44, 260, w * 0.30, 160, 235, 175, 45, 0.48);
      drawVirtualPuff(w * 0.52, 260, w * 0.30, 160, 52, 215, 165, 0.48);
      drawVirtualPuff(w * 0.58, 260, w * 0.28, 150, 42, 185, 215, 0.46);

      // Center-Right & Right: Celestial Cyan & Electric Sky Azure
      drawVirtualPuff(w * 0.72, 260, w * 0.34, 170, 35, 170, 242, 0.52);
      drawVirtualPuff(w * 0.86, 260, w * 0.32, 160, 18, 145, 230, 0.54);

      // Far-Right Edge wash: solidly blankets x=w boundary with deep cobalt & cyan mist
      drawVirtualPuff(w, 260, w * 0.36, 180, 16, 24, 80, 0.65);
      drawVirtualPuff(w, 260, w * 0.28, 160, 45, 185, 245, 0.52);
      drawVirtualPuff(w * 0.96, 260, w * 0.30, 170, 24, 75, 150, 0.55);

      // ── 2. SEAM BLANKET: Thick Volumetric Cloud Mass Evenly Blanketing the Boundary Line ──
      // Spans: Pojok Kiri -> Kiri -> Tengah -> Kanan -> Pojok Kanan
      // Distributes the 6 palette colors organically and abstractly across the whole line
      const seamPuffs = 180;
      for (let i = 0; i < seamPuffs; i++) {
        const px = w * (-0.12 + (i / (seamPuffs - 1)) * 1.24 + (rand() - 0.5) * 0.04);
        const py = 260 + (rand() - 0.5) * 38; // virtual Y: 241 to 279
        const rad = Math.min(w * 0.24, 55 + rand() * 145);
        const aspect = 0.58 + rand() * 0.44;
        const colorType = rand();

        let r = 240, g = 140, b = 20, a = 0.34 + rand() * 0.24;

        if (colorType < 0.24) {
          // 1. Biru Tua (Deep Space Cobalt / Midnight Navy Base)
          r = 16 + Math.round(rand() * 20);
          g = 24 + Math.round(rand() * 24);
          b = 85 + Math.round(rand() * 55);
          a = 0.42 + rand() * 0.22;
        } else if (colorType < 0.45) {
          // 2. Coklat Muda (Warm Bronze / Golden Umber)
          r = 165 + Math.round(rand() * 35);
          g = 95 + Math.round(rand() * 32);
          b = 25 + Math.round(rand() * 22);
          a = 0.36 + rand() * 0.20;
        } else if (colorType < 0.65) {
          // 3. Oranye (Vibrant Solar Amber)
          r = 235 + Math.round(rand() * 20);
          g = 120 + Math.round(rand() * 35);
          b = 14 + Math.round(rand() * 18);
          a = 0.35 + rand() * 0.22;
        } else if (colorType < 0.78) {
          // 4. Kuning (Radiant Golden Yellow)
          r = 248 + Math.round(rand() * 7);
          g = 190 + Math.round(rand() * 35);
          b = 30 + Math.round(rand() * 35);
          a = 0.32 + rand() * 0.20;
        } else if (colorType < 0.89) {
          // 5. Hijau Muda (Fresh Aqua Mint / Emerald Turquoise)
          r = 45 + Math.round(rand() * 35);
          g = 210 + Math.round(rand() * 35);
          b = 165 + Math.round(rand() * 40);
          a = 0.30 + rand() * 0.20;
        } else {
          // 6. Biru (Electric Cyan / Sky Azure)
          r = 35 + Math.round(rand() * 35);
          g = 175 + Math.round(rand() * 40);
          b = 245 + Math.round(rand() * 10);
          a = 0.34 + rand() * 0.22;
        }

        drawVirtualPuff(px, py, rad, rad * aspect, r, g, b, a);
      }

      // ── 2B. CORNER ANCHORS: High-Density Pillows Solidly Locking Pojok Kiri & Pojok Kanan ──
      // Pojok Kiri (Far-Left Corner: x from -18% to +22%):
      for (let i = 0; i < 85; i++) {
        const px = w * (-0.18 + rand() * 0.40);
        const py = 260 + (rand() - 0.5) * 36;
        const rad = Math.min(w * 0.32, 70 + rand() * 155);
        const aspect = 0.58 + rand() * 0.46;
        const type = rand();

        let r = 20, g = 28, b = 90, a = 0.45 + rand() * 0.24;
        if (type < 0.42) {
          // Biru Tua Base
          r = 16 + Math.round(rand() * 18);
          g = 24 + Math.round(rand() * 18);
          b = 85 + Math.round(rand() * 45);
          a = 0.50 + rand() * 0.22;
        } else if (type < 0.72) {
          // Coklat Muda / Warm Bronze
          r = 165 + Math.round(rand() * 35);
          g = 95 + Math.round(rand() * 30);
          b = 25 + Math.round(rand() * 20);
          a = 0.42 + rand() * 0.20;
        } else {
          // Oranye / Solar Amber
          r = 235 + Math.round(rand() * 20);
          g = 125 + Math.round(rand() * 35);
          b = 15 + Math.round(rand() * 20);
          a = 0.38 + rand() * 0.18;
        }
        drawVirtualPuff(px, py, rad, rad * aspect, r, g, b, a);
      }

      // Pojok Kanan (Far-Right Corner: x from 78% to 118%):
      for (let i = 0; i < 85; i++) {
        const px = w * (0.78 + rand() * 0.40);
        const py = 260 + (rand() - 0.5) * 36;
        const rad = Math.min(w * 0.32, 70 + rand() * 155);
        const aspect = 0.58 + rand() * 0.46;
        const type = rand();

        let r = 25, g = 165, b = 240, a = 0.45 + rand() * 0.24;
        if (type < 0.40) {
          // Biru (Electric Cyan)
          r = 30 + Math.round(rand() * 35);
          g = 170 + Math.round(rand() * 40);
          b = 245 + Math.round(rand() * 10);
          a = 0.46 + rand() * 0.20;
        } else if (type < 0.72) {
          // Hijau Muda (Aqua Mint)
          r = 45 + Math.round(rand() * 35);
          g = 210 + Math.round(rand() * 35);
          b = 175 + Math.round(rand() * 35);
          a = 0.38 + rand() * 0.18;
        } else {
          // Biru Tua Base
          r = 16 + Math.round(rand() * 18);
          g = 22 + Math.round(rand() * 20);
          b = 85 + Math.round(rand() * 45);
          a = 0.50 + rand() * 0.22;
        }
        drawVirtualPuff(px, py, rad, rad * aspect, r, g, b, a);
      }

      // ── 3. Volumetric Multi-Layered Cloud Clusters (Multi-Layered Billowing Smoke) ──
      // CLUSTER A: Left (x: -8% to 40%) — Rich organic billowing clouds of Bronze, Amber & Gold
      const leftPuffs = 90;
      for (let i = 0; i < leftPuffs; i++) {
        const px = w * (-0.08 + rand() * 0.48);
        const py = 120 + rand() * 270; // virtual Y: 120 to 390
        const rad = Math.min(w * 0.20, 45 + rand() * 135);
        const aspect = 0.62 + rand() * 0.55;
        const colorType = rand();

        let r = 235, g = 135, b = 20, a = 0.18 + rand() * 0.22;

        if (colorType < 0.30) {
          // Coklat Muda (Warm Bronze / Golden Ochre)
          r = 165 + Math.round(rand() * 35);
          g = 95 + Math.round(rand() * 30);
          b = 25 + Math.round(rand() * 20);
          a = 0.24 + rand() * 0.20;
        } else if (colorType < 0.65) {
          // Oranye (Solar Amber)
          r = 235 + Math.round(rand() * 20);
          g = 125 + Math.round(rand() * 35);
          b = 15 + Math.round(rand() * 20);
          a = 0.22 + rand() * 0.22;
        } else if (colorType < 0.85) {
          // Kuning (Radiant Gold)
          r = 248 + Math.round(rand() * 7);
          g = 195 + Math.round(rand() * 30);
          b = 35 + Math.round(rand() * 30);
          a = 0.18 + rand() * 0.18;
        } else {
          // Biru Tua Base depth
          r = 16 + Math.round(rand() * 20);
          g = 25 + Math.round(rand() * 25);
          b = 85 + Math.round(rand() * 50);
          a = 0.26 + rand() * 0.22;
        }

        drawVirtualPuff(px, py, rad, rad * aspect, r, g, b, a);
      }

      // CLUSTER B: Center (x: 25% to 75%) — Dynamic abstract fusion of Gold, Mint & Cyan!
      const centerPuffs = 110;
      for (let i = 0; i < centerPuffs; i++) {
        const px = w * (0.25 + rand() * 0.50);
        const py = 120 + rand() * 280; // virtual Y: 120 to 400
        const rad = Math.min(w * 0.20, 45 + rand() * 135);
        const aspect = 0.62 + rand() * 0.55;
        const colorType = rand();

        let r = 245, g = 195, b = 40, a = 0.18 + rand() * 0.22;

        if (colorType < 0.26) {
          // Kuning (Radiant Gold)
          r = 248 + Math.round(rand() * 7);
          g = 195 + Math.round(rand() * 35);
          b = 35 + Math.round(rand() * 35);
          a = 0.20 + rand() * 0.20;
        } else if (colorType < 0.50) {
          // Hijau Muda (Fresh Aqua Mint / Emerald Turquoise)
          r = 45 + Math.round(rand() * 35);
          g = 215 + Math.round(rand() * 35);
          b = 165 + Math.round(rand() * 45);
          a = 0.20 + rand() * 0.22;
        } else if (colorType < 0.75) {
          // Biru (Electric Cyan)
          r = 35 + Math.round(rand() * 35);
          g = 175 + Math.round(rand() * 40);
          b = 245 + Math.round(rand() * 10);
          a = 0.20 + rand() * 0.22;
        } else if (colorType < 0.88) {
          // Oranye (Solar Amber streak)
          r = 235 + Math.round(rand() * 20);
          g = 130 + Math.round(rand() * 30);
          b = 18 + Math.round(rand() * 20);
          a = 0.18 + rand() * 0.18;
        } else {
          // Coklat Muda / Bronze depth
          r = 170 + Math.round(rand() * 30);
          g = 100 + Math.round(rand() * 30);
          b = 30 + Math.round(rand() * 20);
          a = 0.22 + rand() * 0.20;
        }

        drawVirtualPuff(px, py, rad, rad * aspect, r, g, b, a);
      }

      // CLUSTER C: Right (x: 60% to 108%) — Soaring celestial clouds of Sky Cyan & Turquoise
      const rightPuffs = 90;
      for (let i = 0; i < rightPuffs; i++) {
        const px = w * (0.60 + rand() * 0.48);
        const py = 120 + rand() * 270; // virtual Y: 120 to 390
        const rad = Math.min(w * 0.20, 45 + rand() * 135);
        const aspect = 0.62 + rand() * 0.55;
        const colorType = rand();

        let r = 35, g = 175, b = 245, a = 0.18 + rand() * 0.22;

        if (colorType < 0.48) {
          // Biru (Electric Cyan / Sky Azure)
          r = 30 + Math.round(rand() * 35);
          g = 170 + Math.round(rand() * 40);
          b = 245 + Math.round(rand() * 10);
          a = 0.22 + rand() * 0.22;
        } else if (colorType < 0.74) {
          // Hijau Muda (Aqua Mint / Turquoise)
          r = 45 + Math.round(rand() * 35);
          g = 210 + Math.round(rand() * 35);
          b = 175 + Math.round(rand() * 35);
          a = 0.18 + rand() * 0.20;
        } else if (colorType < 0.88) {
          // Biru Tua Base
          r = 16 + Math.round(rand() * 20);
          g = 24 + Math.round(rand() * 24);
          b = 85 + Math.round(rand() * 50);
          a = 0.24 + rand() * 0.22;
        } else {
          // Warm Gold glint
          r = 245 + Math.round(rand() * 10);
          g = 185 + Math.round(rand() * 35);
          b = 30 + Math.round(rand() * 30);
          a = 0.16 + rand() * 0.16;
        }

        drawVirtualPuff(px, py, rad, rad * aspect, r, g, b, a);
      }

      // ── 4. UPPER ABSTRACT BILLOWING PLUMES: Organic cloud tendrils rising into Creative ──
      const upperPlumes = 70;
      for (let i = 0; i < upperPlumes; i++) {
        const px = w * (-0.10 + rand() * 1.20);
        const py = 100 + rand() * 150; // virtual Y: 100 to 250
        const rad = Math.min(w * 0.18, 40 + rand() * 125);
        const aspect = 0.60 + rand() * 0.50;
        const normX = px / w;
        const colorType = rand();

        let r = 240, g = 160, b = 25;
        const a = 0.14 + rand() * 0.18;

        if (normX < 0.42) {
          // Left: Bronze, Amber & Gold
          if (colorType < 0.40) {
            r = 235 + Math.round(rand() * 20); g = 135 + Math.round(rand() * 35); b = 15 + Math.round(rand() * 20);
          } else if (colorType < 0.75) {
            r = 170 + Math.round(rand() * 30); g = 100 + Math.round(rand() * 30); b = 25 + Math.round(rand() * 20);
          } else {
            r = 248 + Math.round(rand() * 7); g = 195 + Math.round(rand() * 30); b = 35 + Math.round(rand() * 30);
          }
        } else if (normX < 0.65) {
          // Center: Gold, Mint & Cyan mixture
          if (colorType < 0.38) {
            r = 245 + Math.round(rand() * 10); g = 190 + Math.round(rand() * 35); b = 35 + Math.round(rand() * 35);
          } else if (colorType < 0.72) {
            r = 50 + Math.round(rand() * 35); g = 215 + Math.round(rand() * 35); b = 175 + Math.round(rand() * 35);
          } else {
            r = 40 + Math.round(rand() * 35); g = 180 + Math.round(rand() * 40); b = 245 + Math.round(rand() * 10);
          }
        } else {
          // Right: Cyan, Mint & Deep Cobalt
          if (colorType < 0.60) {
            r = 35 + Math.round(rand() * 35); g = 175 + Math.round(rand() * 40); b = 245 + Math.round(rand() * 10);
          } else if (colorType < 0.85) {
            r = 45 + Math.round(rand() * 35); g = 210 + Math.round(rand() * 35); b = 175 + Math.round(rand() * 35);
          } else {
            r = 18 + Math.round(rand() * 20); g = 25 + Math.round(rand() * 25); b = 90 + Math.round(rand() * 45);
          }
        }

        drawVirtualPuff(px, py, rad, rad * aspect, r, g, b, a);
      }

      // ── 4B. LOWER ABSTRACT BILLOWING PLUMES: Flowing down behind & around "PROJECTS" ──
      const lowerPlumes = 70;
      for (let i = 0; i < lowerPlumes; i++) {
        const px = w * (-0.10 + rand() * 1.20);
        const py = 270 + rand() * 150; // virtual Y: 270 to 420
        const rad = Math.min(w * 0.18, 40 + rand() * 125);
        const aspect = 0.60 + rand() * 0.50;
        const normX = px / w;
        const colorType = rand();

        let r = 240, g = 160, b = 25;
        const a = 0.14 + rand() * 0.18;

        if (normX < 0.40) {
          if (colorType < 0.45) {
            r = 235 + Math.round(rand() * 20); g = 130 + Math.round(rand() * 35); b = 15 + Math.round(rand() * 20);
          } else if (colorType < 0.75) {
            r = 165 + Math.round(rand() * 35); g = 95 + Math.round(rand() * 30); b = 25 + Math.round(rand() * 20);
          } else {
            r = 248 + Math.round(rand() * 7); g = 195 + Math.round(rand() * 30); b = 35 + Math.round(rand() * 30);
          }
        } else if (normX < 0.65) {
          if (colorType < 0.38) {
            r = 245 + Math.round(rand() * 10); g = 190 + Math.round(rand() * 35); b = 35 + Math.round(rand() * 35);
          } else if (colorType < 0.72) {
            r = 50 + Math.round(rand() * 35); g = 215 + Math.round(rand() * 35); b = 175 + Math.round(rand() * 35);
          } else {
            r = 40 + Math.round(rand() * 35); g = 180 + Math.round(rand() * 40); b = 245 + Math.round(rand() * 10);
          }
        } else {
          if (colorType < 0.60) {
            r = 35 + Math.round(rand() * 35); g = 175 + Math.round(rand() * 40); b = 245 + Math.round(rand() * 10);
          } else if (colorType < 0.85) {
            r = 45 + Math.round(rand() * 35); g = 210 + Math.round(rand() * 35); b = 175 + Math.round(rand() * 35);
          } else {
            r = 18 + Math.round(rand() * 20); g = 25 + Math.round(rand() * 25); b = 90 + Math.round(rand() * 45);
          }
        }

        drawVirtualPuff(px, py, rad, rad * aspect, r, g, b, a);
      }

      // ── 5. High-Luminosity Cloud Crests & Highlights (Screen blend) ──
      ctx.globalCompositeOperation = "screen";

      const highlightPuffs = 50;
      for (let i = 0; i < highlightPuffs; i++) {
        const px = w * (0.04 + rand() * 0.92);
        const py = 210 + rand() * 100; // virtual Y: 210 to 310
        const rad = 25 + rand() * 75;
        const tint = rand();

        let r = 255, g = 215, b = 90;
        if (tint < 0.36) {
          r = 255; g = 215; b = 70; // Radiant Solar Yellow Rim
        } else if (tint < 0.68) {
          r = 85; g = 245; b = 185; // Fresh Aqua Mint Rim
        } else {
          r = 95; g = 220; b = 255; // Electric Cyan Rim
        }

        drawVirtualPuff(px, py, rad, rad * 0.58, r, g, b, 0.18 + rand() * 0.18);
      }

      // ── 6. Twinkling Stardust & Sparkle Embers ───────────────────────
      const stardustCount = Math.round(w * 0.09);
      for (let i = 0; i < stardustCount; i++) {
        const sx = rand() * w;
        const sy = 130 + rand() * 260; // virtual Y
        const localSy = sy + offsetY;

        // Skip if outside viewport
        if (localSy < -5 || localSy > h + 5) continue;

        // Safe boundary exclusion zone: do not draw right across seam row
        if (Math.abs(sy - 260) < 20) continue;

        const sz = 0.6 + rand() * 1.8;
        const bright = rand();
        const normX = sx / w;

        let starColor = "rgba(255, 255, 255, ";
        if (normX < 0.40) {
          if (bright < 0.5) starColor = "rgba(254, 235, 150, ";
          else starColor = "rgba(251, 191, 36, ";
        } else if (normX < 0.65) {
          if (bright < 0.5) starColor = "rgba(167, 243, 208, ";
          else starColor = "rgba(52, 211, 153, ";
        } else {
          if (bright < 0.5) starColor = "rgba(186, 230, 253, ";
          else starColor = "rgba(56, 189, 248, ";
        }

        const starAlpha = 0.35 + rand() * 0.65;

        ctx.fillStyle = starColor + starAlpha + ")";
        ctx.beginPath();
        ctx.arc(sx, localSy, sz, 0, Math.PI * 2);
        ctx.fill();

        // Soft halo on larger glints
        if (sz > 1.5 && rand() > 0.45) {
          const halo = ctx.createRadialGradient(sx, localSy, 0, sx, localSy, sz * 4);
          halo.addColorStop(0, starColor + (starAlpha * 0.5) + ")");
          halo.addColorStop(1, starColor + "0)");
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(sx, localSy, sz * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ── 7. Edge Blending (Smooth dissolution away from the seam) ────
      ctx.globalCompositeOperation = "destination-out";

      if (part === "upper") {
        // Upper part: gentle atmospheric dissolve at the top edge (y in [0, 80px])
        const topFade = ctx.createLinearGradient(0, 0, 0, 80);
        topFade.addColorStop(0, "rgba(0, 0, 0, 0.98)");
        topFade.addColorStop(0.45, "rgba(0, 0, 0, 0.5)");
        topFade.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = topFade;
        ctx.fillRect(0, 0, w, 80);
      } else {
        // Lower part: gentle atmospheric dissolve at the bottom edge (y in [h - 85px, h])
        const botFade = ctx.createLinearGradient(0, h - 85, 0, h);
        botFade.addColorStop(0, "rgba(0, 0, 0, 0)");
        botFade.addColorStop(0.55, "rgba(0, 0, 0, 0.5)");
        botFade.addColorStop(1, "rgba(0, 0, 0, 0.98)");
        ctx.fillStyle = botFade;
        ctx.fillRect(0, h - 85, w, 85);
      }

      ctx.globalCompositeOperation = "source-over";
    };

    renderAccretion();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        renderAccretion();
      });
      ro.observe(container);
    }

    const handleResize = () => {
      requestAnimationFrame(renderAccretion);
    };
    window.addEventListener("resize", handleResize);
    if (typeof window !== "undefined" && window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
    }

    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", handleResize);
      if (typeof window !== "undefined" && window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      }
    };
  }, [part]);

  const containerClass =
    part === "upper"
      ? `accretion-horizon-seam-container accretion-horizon-seam-upper ${className}`
      : `accretion-horizon-seam-container accretion-horizon-seam-lower ${className}`;

  return (
    <div ref={containerRef} className={containerClass} aria-hidden="true">
      <canvas ref={canvasRef} className="accretion-horizon-seam-canvas" />
    </div>
  );
}

export default memo(AccretionHorizonSeam);
