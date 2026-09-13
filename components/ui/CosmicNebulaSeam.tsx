"use client";
import React, { memo, useEffect, useRef } from "react";

/**
 * Deterministic PRNG — guarantees the nebula cloud billows, stardust,
 * and colors render identically on every repaint, reload, and across both
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

interface CosmicNebulaSeamProps {
  /**
   * "upper": Renders inside ProcessSteps (HIW), height 400px, anchored at bottom: 0.
   *          Draws virtual coordinate range Y in [80, 480].
   * "lower": Renders inside HorizonShowcase (Creative), height 400px, anchored at top: 0.
   *          Draws virtual coordinate range Y in [480, 880].
   */
  part?: "upper" | "lower";
  className?: string;
}

// Virtual canvas dimensions
const SEAM_Y = 480; // The exact seam boundary where both sections meet
const UPPER_HEIGHT = 400;
const LOWER_HEIGHT = 400;

/**
 * CosmicNebulaSeam — 100% pure procedural code volumetric cosmic nebula.
 * Mathematically connects the HIW (How I Work) section and the Creative Playground
 * section without ANY static PNG/WebP files.
 */
function CosmicNebulaSeam({ part = "upper", className = "" }: CosmicNebulaSeamProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let lastW = 0;
    let lastH = 0;
    let lastDpr = 0;

    const renderNebula = () => {
      // Use window.innerWidth and document.documentElement.clientWidth to guarantee
      // identical full-viewport width across both upper and lower canvases, especially
      // when the user zooms in or zooms out in the browser.
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

      // Virtual Y offset for this part:
      // upper: virtual Y in [80, 480] -> row 399 corresponds precisely to vcy = 480
      // lower: virtual Y in [480, 880] -> row 0 corresponds precisely to vcy = 480
      const offsetY = part === "upper" ? -(SEAM_Y - UPPER_HEIGHT) - 1 : -SEAM_Y;

      // Deterministic PRNG seed — identical for both upper and lower halves!
      const rand = mulberry32(942183);

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

        // Continuity across the seam:
        // Opacity MUST be 100% mathematically IDENTICAL between upper and lower halves!
        if (vcy < 460) {
          const factor = Math.max(0, (vcy - 200) / 260);
          finalAlpha *= factor * factor;
        } else if (vcy > 510) {
          const factor = Math.max(0, (730 - vcy) / 220);
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
      // Spans virtual Y = 480 ± 100px across the entire width (w)
      // Soft atmospheric transition matching the #0b0d30 seam tone without sharp linear edges
      const seamWash = ctx.createLinearGradient(0, 480 + offsetY - 100, 0, 480 + offsetY + 100);
      seamWash.addColorStop(0, "rgba(11, 13, 48, 0)");
      seamWash.addColorStop(0.25, "rgba(35, 20, 85, 0.45)");
      seamWash.addColorStop(0.5, "rgba(82, 34, 158, 0.65)");
      seamWash.addColorStop(0.75, "rgba(35, 20, 85, 0.45)");
      seamWash.addColorStop(1, "rgba(11, 13, 48, 0)");
      ctx.fillStyle = seamWash;
      ctx.fillRect(0, 480 + offsetY - 100, w, 200);

      // ── 1. Broad Ambient Cosmic Gas Glows (Centered on Seam Y = 480) ────
      // Centered precisely on vcy = 480 so both upper (HIW) and lower (Horizon) halves
      // receive 100% mathematically symmetric cosmic gas coverage across the seam line
      ctx.globalCompositeOperation = "source-over";

      // Far-Left Edge wash: solidly blankets x=0 boundary
      drawVirtualPuff(0, 480, w * 0.38, 280, 26, 32, 110, 0.65);
      drawVirtualPuff(0, 480, w * 0.30, 240, 55, 45, 180, 0.55);
      drawVirtualPuff(0, 480, w * 0.22, 200, 42, 175, 240, 0.45);
      drawVirtualPuff(w * 0.04, 480, w * 0.32, 260, 24, 32, 95, 0.58);

      // Left: Deep cosmic indigo/navy wash covering lower planet
      drawVirtualPuff(w * 0.14, 480, w * 0.38, 260, 24, 32, 95, 0.54);
      drawVirtualPuff(w * 0.22, 480, w * 0.34, 240, 67, 56, 202, 0.46);

      // Center: Royal violet & purple core
      drawVirtualPuff(w * 0.48, 480, w * 0.4, 250, 147, 51, 234, 0.44);
      drawVirtualPuff(w * 0.55, 480, w * 0.35, 240, 192, 38, 211, 0.42);

      // Center-Right: Vivid magenta hot region
      drawVirtualPuff(w * 0.68, 480, w * 0.34, 240, 219, 39, 119, 0.42);

      // Right: Deep purple/indigo billowing bank
      drawVirtualPuff(w * 0.88, 480, w * 0.32, 250, 109, 40, 217, 0.46);
      drawVirtualPuff(w * 0.95, 480, w * 0.28, 240, 49, 46, 129, 0.42);

      // Far-Right Edge wash: solidly blankets x=w boundary
      drawVirtualPuff(w, 480, w * 0.38, 280, 26, 30, 105, 0.65);
      drawVirtualPuff(w, 480, w * 0.30, 240, 135, 38, 220, 0.58);
      drawVirtualPuff(w, 480, w * 0.22, 200, 215, 45, 215, 0.48);
      drawVirtualPuff(w * 0.96, 480, w * 0.32, 260, 68, 38, 145, 0.56);

      // ── 2. SEAM BLANKET: Thick Volumetric Cloud Mass Evenly Blanketing the Boundary Line ──
      // Spans: Pojok Kiri -> Kiri -> Tengah -> Kanan -> Pojok Kanan
      // Centered precisely on vcy = 480 ± 26px to create an organic, impenetrable bridge across the seam.
      const seamPuffs = 180;
      for (let i = 0; i < seamPuffs; i++) {
        const px = w * (-0.12 + (i / (seamPuffs - 1)) * 1.24 + (rand() - 0.5) * 0.04);
        const py = 480 + (rand() - 0.5) * 52; // virtual Y: 454 to 506
        const rad = Math.min(w * 0.24, 75 + rand() * 175);
        const aspect = 0.58 + rand() * 0.44;
        const colorType = rand();

        let r = 120, g = 35, b = 210, a = 0.32 + rand() * 0.24;

        if (colorType < 0.28) {
          // Deep Cosmic Indigo (rich dark blue base matching #0b0d30 tone)
          r = 24 + Math.round(rand() * 32);
          g = 32 + Math.round(rand() * 32);
          b = 110 + Math.round(rand() * 70);
          a = 0.38 + rand() * 0.2;
        } else if (colorType < 0.62) {
          // Royal Purple / Violet
          r = 125 + Math.round(rand() * 50);
          g = 40 + Math.round(rand() * 35);
          b = 215 + Math.round(rand() * 40);
          a = 0.34 + rand() * 0.2;
        } else if (colorType < 0.85) {
          // Electric Magenta / Fuchsia
          r = 212 + Math.round(rand() * 43);
          g = 55 + Math.round(rand() * 40);
          b = 215 + Math.round(rand() * 35);
          a = 0.3 + rand() * 0.18;
        } else {
          // Celestial Cyan Mist
          r = 45 + Math.round(rand() * 35);
          g = 175 + Math.round(rand() * 50);
          b = 240 + Math.round(rand() * 15);
          a = 0.25 + rand() * 0.16;
        }

        drawVirtualPuff(px, py, rad, rad * aspect, r, g, b, a);
      }

      // ── 2B. CORNER ANCHORS: High-Density Pillows Solidly Locking Pojok Kiri & Pojok Kanan ──
      // Pojok Kiri (Far-Left Corner: x from -18% to +22%, heavy billowing cloud mass):
      for (let i = 0; i < 110; i++) {
        const px = w * (-0.18 + rand() * 0.40);
        const py = 480 + (rand() - 0.5) * 44;
        const rad = Math.min(w * 0.34, 95 + rand() * 195);
        const aspect = 0.58 + rand() * 0.46;
        const type = rand();

        let r = 24, g = 30, b = 115, a = 0.48 + rand() * 0.24;
        if (type < 0.42) {
          // Deep Cosmic Indigo Base (solid foundation)
          r = 20 + Math.round(rand() * 20);
          g = 26 + Math.round(rand() * 20);
          b = 108 + Math.round(rand() * 52);
          a = 0.52 + rand() * 0.22;
        } else if (type < 0.74) {
          // Royal Violet
          r = 105 + Math.round(rand() * 52);
          g = 34 + Math.round(rand() * 36);
          b = 208 + Math.round(rand() * 40);
          a = 0.44 + rand() * 0.22;
        } else {
          // Celestial Cyan Mist
          r = 40 + Math.round(rand() * 35);
          g = 168 + Math.round(rand() * 52);
          b = 238 + Math.round(rand() * 17);
          a = 0.36 + rand() * 0.18;
        }
        drawVirtualPuff(px, py, rad, rad * aspect, r, g, b, a);
      }

      // Pojok Kanan (Far-Right Corner: x from 78% to 118%, heavy billowing cloud mass):
      for (let i = 0; i < 110; i++) {
        const px = w * (0.78 + rand() * 0.40);
        const py = 480 + (rand() - 0.5) * 44;
        const rad = Math.min(w * 0.34, 95 + rand() * 195);
        const aspect = 0.58 + rand() * 0.46;
        const type = rand();

        let r = 125, g = 35, b = 215, a = 0.48 + rand() * 0.24;
        if (type < 0.40) {
          // Royal Violet / Electric Purple
          r = 122 + Math.round(rand() * 50);
          g = 34 + Math.round(rand() * 38);
          b = 212 + Math.round(rand() * 40);
          a = 0.48 + rand() * 0.22;
        } else if (type < 0.72) {
          // Vivid Magenta
          r = 208 + Math.round(rand() * 42);
          g = 46 + Math.round(rand() * 42);
          b = 212 + Math.round(rand() * 38);
          a = 0.40 + rand() * 0.20;
        } else {
          // Deep Cosmic Indigo Base
          r = 22 + Math.round(rand() * 22);
          g = 24 + Math.round(rand() * 24);
          b = 104 + Math.round(rand() * 56);
          a = 0.52 + rand() * 0.22;
        }
        drawVirtualPuff(px, py, rad, rad * aspect, r, g, b, a);
      }

      // ── 3. TARGETED SPOTS: Ultra-Dense Volumetric Cloud Billows on the 4 User-Marked Spots ──
      // Spot 1: Under "01 DISCOVER" (x: -0.02*w to 0.26*w)
      // Dense celestial cyan, deep cosmic indigo, and royal violet cloud pillows seamlessly bridging the seam
      for (let i = 0; i < 48; i++) {
        const px = w * (-0.02 + rand() * 0.28);
        const py = 480 + (rand() - 0.5) * 48;
        const rad = Math.min(w * 0.22, 60 + rand() * 155);
        const aspect = 0.6 + rand() * 0.45;
        const type = rand();

        let r = 45, g = 175, b = 240, a = 0.34 + rand() * 0.24;
        if (type < 0.38) {
          // Celestial Cyan / Electric Azure
          r = 40 + Math.round(rand() * 35);
          g = 170 + Math.round(rand() * 50);
          b = 238 + Math.round(rand() * 17);
          a = 0.32 + rand() * 0.22;
        } else if (type < 0.72) {
          // Deep Cosmic Indigo (anchoring lower planet seamlessly into deep space)
          r = 20 + Math.round(rand() * 25);
          g = 28 + Math.round(rand() * 25);
          b = 100 + Math.round(rand() * 65);
          a = 0.4 + rand() * 0.22;
        } else {
          // Royal Violet
          r = 115 + Math.round(rand() * 45);
          g = 42 + Math.round(rand() * 35);
          b = 215 + Math.round(rand() * 35);
          a = 0.34 + rand() * 0.22;
        }
        drawVirtualPuff(px, py, rad, rad * aspect, r, g, b, a);
      }

      // Spot 2: Between "01 DISCOVER" and "02 DESIGN" (x: 0.26*w to 0.48*w)
      // Rich magenta, electric purple, and deep violet billowing clouds
      for (let i = 0; i < 48; i++) {
        const px = w * (0.26 + rand() * 0.22);
        const py = 480 + (rand() - 0.5) * 48;
        const rad = Math.min(w * 0.22, 60 + rand() * 155);
        const aspect = 0.6 + rand() * 0.45;
        const type = rand();

        let r = 195, g = 45, b = 215, a = 0.34 + rand() * 0.24;
        if (type < 0.45) {
          // Electric Magenta / Fuchsia
          r = 215 + Math.round(rand() * 38);
          g = 48 + Math.round(rand() * 42);
          b = 215 + Math.round(rand() * 35);
          a = 0.36 + rand() * 0.22;
        } else if (type < 0.8) {
          // Royal Violet / Purple
          r = 135 + Math.round(rand() * 45);
          g = 38 + Math.round(rand() * 35);
          b = 225 + Math.round(rand() * 30);
          a = 0.36 + rand() * 0.22;
        } else {
          // Deep Indigo base
          r = 25 + Math.round(rand() * 25);
          g = 25 + Math.round(rand() * 25);
          b = 95 + Math.round(rand() * 60);
          a = 0.4 + rand() * 0.2;
        }
        drawVirtualPuff(px, py, rad, rad * aspect, r, g, b, a);
      }

      // Spot 3: Under "03 BUILD" & "04 LAUNCH" (x: 0.48*w to 0.82*w)
      // Widest highlighted zone — dense, overlapping billowing magenta, fuchsia & violet clouds
      for (let i = 0; i < 68; i++) {
        const px = w * (0.48 + rand() * 0.34);
        const py = 480 + (rand() - 0.5) * 50;
        const rad = Math.min(w * 0.22, 65 + rand() * 160);
        const aspect = 0.58 + rand() * 0.46;
        const type = rand();

        let r = 225, g = 50, b = 205, a = 0.36 + rand() * 0.24;
        if (type < 0.5) {
          // Vivid Fuchsia / Hot Magenta
          r = 222 + Math.round(rand() * 32);
          g = 45 + Math.round(rand() * 45);
          b = 195 + Math.round(rand() * 50);
          a = 0.38 + rand() * 0.22;
        } else if (type < 0.82) {
          // Electric Royal Purple
          r = 142 + Math.round(rand() * 50);
          g = 42 + Math.round(rand() * 38);
          b = 228 + Math.round(rand() * 27);
          a = 0.35 + rand() * 0.22;
        } else {
          // Deep Cosmic Indigo foundation
          r = 28 + Math.round(rand() * 28);
          g = 22 + Math.round(rand() * 28);
          b = 105 + Math.round(rand() * 60);
          a = 0.42 + rand() * 0.2;
        }
        drawVirtualPuff(px, py, rad, rad * aspect, r, g, b, a);
      }

      // Spot 4: Far-Right zone under edge of "04 LAUNCH" (x: 0.80*w to 1.02*w)
      // Dense violet, indigo, and fuchsia cloud bank completely concealing the right boundary
      for (let i = 0; i < 48; i++) {
        const px = w * (0.80 + rand() * 0.22);
        const py = 480 + (rand() - 0.5) * 48;
        const rad = Math.min(w * 0.22, 60 + rand() * 155);
        const aspect = 0.6 + rand() * 0.45;
        const type = rand();

        let r = 120, g = 35, b = 210, a = 0.36 + rand() * 0.24;
        if (type < 0.45) {
          // Royal Violet / Deep Purple
          r = 125 + Math.round(rand() * 48);
          g = 35 + Math.round(rand() * 35);
          b = 212 + Math.round(rand() * 40);
          a = 0.38 + rand() * 0.22;
        } else if (type < 0.75) {
          // Vivid Magenta
          r = 210 + Math.round(rand() * 42);
          g = 48 + Math.round(rand() * 42);
          b = 215 + Math.round(rand() * 35);
          a = 0.34 + rand() * 0.22;
        } else {
          // Deep Indigo base
          r = 25 + Math.round(rand() * 30);
          g = 30 + Math.round(rand() * 30);
          b = 105 + Math.round(rand() * 70);
          a = 0.42 + rand() * 0.22;
        }
        drawVirtualPuff(px, py, rad, rad * aspect, r, g, b, a);
      }

      // ── 4. Volumetric Cloud Clusters (Multi-Layered Billowing Smoke) ──
      // CLUSTER A: Left (x: -8% to 36%) — Wrapping and submerging lower planet body
      const leftPuffs = 100;
      for (let i = 0; i < leftPuffs; i++) {
        const px = w * (-0.08 + rand() * 0.44);
        const py = 220 + rand() * 460; // virtual Y: 220 to 680
        const rad = Math.min(w * 0.18, 45 + rand() * 155);
        const aspect = 0.65 + rand() * 0.65;
        const colorType = rand();

        let r = 79, g = 70, b = 229, a = 0.16 + rand() * 0.22;

        if (colorType < 0.35) {
          r = 25 + Math.round(rand() * 35);
          g = 35 + Math.round(rand() * 35);
          b = 95 + Math.round(rand() * 85);
          a = 0.22 + rand() * 0.25;
        } else if (colorType < 0.68) {
          r = 115 + Math.round(rand() * 50);
          g = 35 + Math.round(rand() * 35);
          b = 210 + Math.round(rand() * 45);
          a = 0.18 + rand() * 0.22;
        } else if (colorType < 0.86) {
          r = 45 + Math.round(rand() * 35);
          g = 175 + Math.round(rand() * 55);
          b = 240 + Math.round(rand() * 15);
          a = 0.12 + rand() * 0.18;
        } else {
          r = 215 + Math.round(rand() * 40);
          g = 50 + Math.round(rand() * 40);
          b = 220 + Math.round(rand() * 35);
          a = 0.14 + rand() * 0.18;
        }

        drawVirtualPuff(px, py, rad, rad * aspect, r, g, b, a);
      }

      // CLUSTER B: Center (x: 28% to 74%) — Billowing magenta/purple sea
      const centerPuffs = 120;
      for (let i = 0; i < centerPuffs; i++) {
        const px = w * (0.24 + rand() * 0.52);
        const py = 220 + rand() * 470; // virtual Y: 220 to 690
        const rad = Math.min(w * 0.18, 45 + rand() * 150);
        const aspect = 0.65 + rand() * 0.65;
        const colorType = rand();

        let r = 168, g = 85, b = 247, a = 0.16 + rand() * 0.2;

        if (colorType < 0.42) {
          r = 215 + Math.round(rand() * 40);
          g = 45 + Math.round(rand() * 45);
          b = 210 + Math.round(rand() * 45);
          a = 0.18 + rand() * 0.24;
        } else if (colorType < 0.76) {
          r = 135 + Math.round(rand() * 50);
          g = 40 + Math.round(rand() * 40);
          b = 225 + Math.round(rand() * 30);
          a = 0.16 + rand() * 0.22;
        } else {
          r = 85 + Math.round(rand() * 55);
          g = 185 + Math.round(rand() * 55);
          b = 245 + Math.round(rand() * 10);
          a = 0.11 + rand() * 0.16;
        }

        drawVirtualPuff(px, py, rad, rad * aspect, r, g, b, a);
      }

      // CLUSTER C: Right (x: 68% to 105%) — Rising violet cloud bank
      const rightPuffs = 100;
      for (let i = 0; i < rightPuffs; i++) {
        const px = w * (0.66 + rand() * 0.4);
        const py = 220 + rand() * 470; // virtual Y: 220 to 690
        const rad = Math.min(w * 0.18, 45 + rand() * 155);
        const aspect = 0.7 + rand() * 0.6;
        const colorType = rand();

        let r = 126, g = 34, b = 206, a = 0.16 + rand() * 0.22;

        if (colorType < 0.48) {
          r = 110 + Math.round(rand() * 50);
          g = 35 + Math.round(rand() * 35);
          b = 205 + Math.round(rand() * 50);
          a = 0.18 + rand() * 0.24;
        } else if (colorType < 0.78) {
          r = 205 + Math.round(rand() * 45);
          g = 55 + Math.round(rand() * 45);
          b = 215 + Math.round(rand() * 40);
          a = 0.16 + rand() * 0.2;
        } else {
          r = 40 + Math.round(rand() * 40);
          g = 50 + Math.round(rand() * 40);
          b = 150 + Math.round(rand() * 80);
          a = 0.2 + rand() * 0.22;
        }

        drawVirtualPuff(px, py, rad, rad * aspect, r, g, b, a);
      }

      // ── 4B. UPPER ABSTRACT BILLOWING PLUMES: Organic cloud tendrils & lobes rising into HIW ──
      // Spreads abstractly and non-linearly across the upper section, matching Creative Playground
      const upperPlumes = 75;
      for (let i = 0; i < upperPlumes; i++) {
        const px = w * (-0.10 + rand() * 1.20);
        // Varying heights: some rising to vcy = 210, some to 420
        const py = 210 + rand() * 220;
        const rad = Math.min(w * 0.20, 50 + rand() * 145);
        const aspect = 0.62 + rand() * 0.48;
        const colorType = rand();

        let r = 135, g = 50, b = 220, a = 0.16 + rand() * 0.22;
        if (colorType < 0.32) {
          // Deep Cosmic Indigo Base
          r = 24 + Math.round(rand() * 30);
          g = 30 + Math.round(rand() * 30);
          b = 105 + Math.round(rand() * 75);
          a = 0.22 + rand() * 0.20;
        } else if (colorType < 0.65) {
          // Royal Violet / Electric Purple
          r = 125 + Math.round(rand() * 50);
          g = 38 + Math.round(rand() * 38);
          b = 218 + Math.round(rand() * 32);
          a = 0.18 + rand() * 0.20;
        } else if (colorType < 0.84) {
          // Vivid Magenta
          r = 215 + Math.round(rand() * 38);
          g = 48 + Math.round(rand() * 42);
          b = 212 + Math.round(rand() * 36);
          a = 0.15 + rand() * 0.18;
        } else {
          // Celestial Cyan Mist
          r = 45 + Math.round(rand() * 35);
          g = 172 + Math.round(rand() * 50);
          b = 240 + Math.round(rand() * 15);
          a = 0.14 + rand() * 0.16;
        }
        drawVirtualPuff(px, py, rad, rad * aspect, r, g, b, a);
      }

      // ── 5. High-Luminosity Cloud Crests & Highlights (Screen blend) ──
      ctx.globalCompositeOperation = "screen";

      const highlightPuffs = 60;
      for (let i = 0; i < highlightPuffs; i++) {
        const px = w * (0.04 + rand() * 0.92);
        const py = 410 + rand() * 150; // virtual Y: 410 to 560
        const rad = 25 + rand() * 85;
        const tint = rand();

        let r = 180, g = 140, b = 255;
        if (tint < 0.38) {
          r = 90; g = 210; b = 255; // cyan starlight rim
        } else if (tint < 0.72) {
          r = 255; g = 110; b = 225; // vivid magenta / pink rim
        }

        drawVirtualPuff(px, py, rad, rad * 0.6, r, g, b, 0.2 + rand() * 0.2);
      }

      // ── 6. Twinkling Stardust & Sparkle Embers ───────────────────────
      const stardustCount = Math.round(w * 0.09);
      for (let i = 0; i < stardustCount; i++) {
        const sx = rand() * w;
        const sy = 280 + rand() * 460; // virtual Y
        const localSy = sy + offsetY;

        // Skip if outside viewport
        if (localSy < -5 || localSy > h + 5) continue;

        // Strict boundary exclusion zone: never place any star or star halo
        // within 42px of the section seam line (sy = 480 ± 42px).
        // This completely prevents stars from landing on the seam or being cut in half!
        if (Math.abs(sy - 480) < 42) continue;

        const sz = 0.6 + rand() * 1.8;
        const bright = rand();

        let starColor = "rgba(255, 255, 255, ";
        if (bright < 0.3) starColor = "rgba(165, 230, 255, ";
        else if (bright < 0.55) starColor = "rgba(255, 185, 240, ";
        else if (bright < 0.75) starColor = "rgba(255, 230, 180, ";

        const starAlpha = 0.35 + rand() * 0.65;

        ctx.fillStyle = starColor + starAlpha + ")";
        ctx.beginPath();
        ctx.arc(sx, localSy, sz, 0, Math.PI * 2);
        ctx.fill();

        // Soft halo on larger glints
        if (sz > 1.6 && rand() > 0.5) {
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
        // Upper part: gentle atmospheric dissolve only at the very top edge (y in [0, 110px])
        // near the orbit line, while letting the clouds billow freely, widely, and abstractly
        // across the entire upper section, matching Creative Playground's organic dispersion!
        const topFade = ctx.createLinearGradient(0, 0, 0, 110);
        topFade.addColorStop(0, "rgba(0, 0, 0, 0.98)");
        topFade.addColorStop(0.45, "rgba(0, 0, 0, 0.5)");
        topFade.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = topFade;
        ctx.fillRect(0, 0, w, 110);
      } else {
        // Lower part: gently fade the bottom edge of the nebula (y in [280, 400px])
        // into the deep space behind StarChart and above CREATIVE.
        // Top edge (y = 0px, the seam) is UNTOUCHED (100% solid clouds)!
        const botFade = ctx.createLinearGradient(0, h - 120, 0, h);
        botFade.addColorStop(0, "rgba(0, 0, 0, 0)");
        botFade.addColorStop(0.6, "rgba(0, 0, 0, 0.6)");
        botFade.addColorStop(1, "rgba(0, 0, 0, 0.98)");
        ctx.fillStyle = botFade;
        ctx.fillRect(0, h - 120, w, 120);
      }

      ctx.globalCompositeOperation = "source-over";
    };

    renderNebula();

    // 1. ResizeObserver for precise container layout tracking across browser zoom levels
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        renderNebula();
      });
      ro.observe(container);
    }

    // 2. Window resize & visualViewport zoom tracking
    const handleResize = () => {
      requestAnimationFrame(renderNebula);
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
      ? `cosmic-nebula-seam-container cosmic-nebula-seam-upper ${className}`
      : `cosmic-nebula-seam-container cosmic-nebula-seam-lower ${className}`;

  return (
    <div ref={containerRef} className={containerClass} aria-hidden="true">
      <canvas ref={canvasRef} className="cosmic-nebula-seam-canvas" />
    </div>
  );
}

export default memo(CosmicNebulaSeam);
