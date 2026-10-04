import { animate, type AnimationPlaybackControls } from "motion/react";
import {
  COLS,
  CROP,
  LOCAL,
  OVERSAMPLE,
  clampToDisc,
  dotRadius,
  hexGrid,
  inkOf,
  lensDiameter,
  localNormalise,
  luma,
  percentiles,
  stretch,
  waveFront,
} from "@/lib/hero/halftone";
import { atRest, stepSpring, type SpringState } from "@/lib/hero/spring";
import { layoutCentre } from "./layout";

/**
 * The portrait: the photograph, printed as a field of dots. A dot's size is the light in that place
 * in the photograph, so what you see is a halftone screen made of the same full stop that ends the
 * headline. Where the pointer rests a lens opens (the headline's lens: the same ring, ticks and
 * readout) and inside it the photograph itself is shown.
 *
 * Nothing here is drawn per frame. The dots are printed once on a canvas (again when the window or
 * the theme changes); they come in as a soft-edged wave of light that leaves the headline's full stop,
 * which is a mask moving over that finished canvas; and the lens is made the way the headline's is,
 * a window with a copy of the photograph inside it, both moved by plain translations. (The first
 * version redrew five thousand dots on every pointer frame and cost 15 ms a frame on an integrated
 * GPU: the page's quality governor read it as a struggling device and lowered the tier.)
 *
 * The pointer system (pointer.ts) calls `drive` from its own loop, so there is still one
 * requestAnimationFrame loop for everything that follows the mouse.
 *
 * The <img> stays in the page (it is the portrait for assistive tech, and what shows if this never
 * runs); once the dots are ready the figure is marked `data-dots` and the <img> is hidden.
 */

export interface PortraitDots {
  /** Brings the dots in as a wave of light that leaves the headline's full stop. Returns the animation. */
  develop: (delaySeconds: number) => AnimationPlaybackControls;
  /**
   * Called from the pointer loop with the pointer's place (client px; null when it has left) and the
   * frame time. Returns true while the lens is still moving, so the loop keeps running.
   */
  drive: (x: number | null, y: number, dt: number, mode: { spring: boolean }) => boolean;
  /** The pointer system is gone: close the lens. */
  release: () => void;
  dispose: () => void;
}

const LENS_SPRING = { stiffness: 120, damping: 17, mass: 1 };
const LABEL_EVERY_MS = 80;
const TAU = Math.PI * 2;

/** The one slow pass a touch screen gets: it has no hover to discover the lens with. */
let swept = false;

interface Palette {
  inks: [string, string, string];
}

function readPalette(root: HTMLElement): Palette {
  const cs = getComputedStyle(root);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  // Three inks by tone: the shadows in violet, the middle in the accent, the lights in the page's ink.
  return { inks: [v("--accent-purple", "#8b7cf6"), v("--hx-accent", "#4fb8e0"), `rgb(${v("--hx-ink-rgb", "244, 248, 255")})`] };
}

export function createPortraitDots(root: HTMLElement, options: { sweep: boolean }): PortraitDots | null {
  const figure = root.querySelector<HTMLElement>(".hx-portrait");
  const canvas = figure?.querySelector<HTMLCanvasElement>("canvas.hx-dots");
  const img = figure?.querySelector<HTMLImageElement>("img.hx-photo");
  const pl = figure?.querySelector<HTMLElement>(".hx-pl");
  const win = pl?.querySelector<HTMLElement>(".hx-pl-win");
  const copy = pl?.querySelector<HTMLElement>(".hx-pl-copy");
  const ring = pl?.querySelector<HTMLElement>(".hx-pl-ring");
  const label = pl?.querySelector<HTMLElement>(".hx-pl-label");
  const photoCanvas = pl?.querySelector<HTMLCanvasElement>("canvas.hx-pl-photo");
  const stopEl = root.querySelector<HTMLElement>("h1.hx-title .hx-ping");
  if (!figure || !canvas || !img || !pl || !win || !copy || !ring || !label || !photoCanvas) return null;
  const ctx = canvas.getContext("2d");
  const photoCtx = photoCanvas.getContext("2d");
  if (!ctx || !photoCtx) return null;
  const html = document.documentElement;

  const grid = hexGrid(COLS);
  const tones = new Float32Array(grid.n);
  let raw = new Float32Array(0);
  let rawSide = 0;
  /**
   * The photograph at its own pixels. The <img> in the page has a density from its srcset, which makes
   * its natural size something other than the file's, and drawImage's source rectangle is in file pixels.
   * A plain Image of the same file (from the cache) has no such correction.
   */
  let source: HTMLImageElement | null = null;

  let ready = false;
  let disposed = false;
  let light = html.getAttribute("data-theme") === "light";
  let palette = readPalette(root);

  // Geometry, in CSS px: the disc is D across; the lens is lensD.
  let D = 0;
  let dpr = 1;
  let lensD = 0;
  let wave = { travel: 1, band: 1 };

  // Starts hidden when the entrance is still to come; the wave then brings it in.
  let arrived = !html.hasAttribute("data-hero");
  let developed = false;

  const lens = { x: { x: 0, v: 0 } as SpringState, y: { x: 0, v: 0 } as SpringState, on: false, placed: false, wx: NaN, wy: NaN };
  let sweeping: { stop: () => void } | null = null;
  let lastLabel = 0;
  let sweepTimer = 0;

  // ── The wave: a mask over the finished canvas ────────────────────────────
  const setFront = (front: number) => {
    canvas.style.setProperty("--wr", `${Math.round(front)}px`);
  };
  const arrive = () => {
    arrived = true;
    canvas.setAttribute("data-in", "");
    canvas.style.removeProperty("--wr");
  };
  if (!arrived) {
    canvas.removeAttribute("data-in");
    canvas.style.setProperty("--wr", "0px");
  } else {
    canvas.setAttribute("data-in", "");
  }

  // ── Tones: sampled once from the photograph ──────────────────────────────
  const sample = () => {
    if (!source) return false;
    const side = COLS * OVERSAMPLE;
    const c = document.createElement("canvas");
    c.width = side;
    c.height = side;
    const g = c.getContext("2d", { willReadFrequently: true });
    if (!g) return false;
    const iw = source.naturalWidth;
    const ih = source.naturalHeight;
    const sw = CROP.s * iw;
    const sh = CROP.s * ih;
    g.imageSmoothingQuality = "high";
    g.drawImage(source, CROP.cx * iw - sw / 2, CROP.cy * ih - sh / 2, sw, sh, 0, 0, side, side);
    const px = g.getImageData(0, 0, side, side).data;
    const lum = new Float32Array(side * side);
    for (let i = 0; i < lum.length; i++) lum[i] = luma(px[i * 4], px[i * 4 + 1], px[i * 4 + 2]);
    raw = lum;
    rawSide = side;
    const local = localNormalise(lum, side, side * LOCAL.radius, LOCAL.k, LOCAL.keep);

    const vals = new Float32Array(grid.n);
    for (let i = 0; i < grid.n; i++) {
      const u = Math.round((grid.x[i] * 0.5 + 0.5) * (side - 1));
      const v = Math.round((grid.y[i] * 0.5 + 0.5) * (side - 1));
      let sum = 0;
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const xx = Math.min(side - 1, Math.max(0, u + dx));
          const yy = Math.min(side - 1, Math.max(0, v + dy));
          sum += local[yy * side + xx];
          n++;
        }
      }
      vals[i] = sum / n;
    }
    const lv = percentiles(vals, 0.03, 0.985);
    for (let i = 0; i < grid.n; i++) tones[i] = stretch(vals[i], lv, 0.95);
    return true;
  };

  /** Prints the dots: on a dark page light is ink; on a light page it is the other way round. */
  const paint = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, D, D);
    const R = D / 2;
    const pitchPx = grid.pitch * R;
    for (let k = 0; k < 3; k++) {
      ctx.fillStyle = palette.inks[k];
      ctx.beginPath();
      for (let i = 0; i < grid.n; i++) {
        const t = light ? 1 - tones[i] : tones[i];
        if (inkOf(t) !== k) continue;
        const r = dotRadius(t) * pitchPx;
        if (r < 0.2) continue;
        const x = R + grid.x[i] * R;
        const y = R + grid.y[i] * R;
        ctx.moveTo(x + r, y);
        ctx.arc(x, y, r, 0, TAU);
      }
      ctx.fill();
    }
  };

  /** The photograph as the lens shows it: the crop, cut to the disc, at device resolution. */
  const paintPhoto = () => {
    if (!source) return;
    const size = Math.max(2, Math.round(D * dpr));
    photoCanvas.width = size;
    photoCanvas.height = size;
    photoCanvas.style.width = `${D}px`;
    photoCanvas.style.height = `${D}px`;
    const iw = source.naturalWidth;
    const ih = source.naturalHeight;
    const sw = CROP.s * iw;
    const sh = CROP.s * ih;
    photoCtx.imageSmoothingQuality = "high";
    photoCtx.drawImage(source, CROP.cx * iw - sw / 2, CROP.cy * ih - sh / 2, sw, sh, 0, 0, size, size);
    photoCtx.globalCompositeOperation = "destination-in";
    photoCtx.beginPath();
    photoCtx.arc(size / 2, size / 2, size / 2, 0, TAU);
    photoCtx.fill();
    photoCtx.globalCompositeOperation = "source-over";
  };

  const wavePlan = () => {
    const R = D / 2;
    let ox = -R * 1.6;
    let oy = 0;
    if (stopEl) {
      const s = layoutCentre(stopEl, root);
      const f = layoutCentre(figure, root);
      ox = s.x - f.x;
      oy = s.y - f.y;
    }
    const band = Math.max(40, D * 0.45);
    // The farthest dot is on the far side of the disc from the origin.
    wave = { travel: Math.hypot(ox, oy) + R, band };
    canvas.style.setProperty("--wx", `${Math.round(R + ox)}px`);
    canvas.style.setProperty("--wy", `${Math.round(R + oy)}px`);
    canvas.style.setProperty("--wb", `${Math.round(band)}px`);
  };

  const layout = () => {
    const nextD = figure.offsetWidth;
    if (nextD < 8) return;
    D = nextD;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    lensD = Math.min(lensDiameter(window.innerWidth), D * 0.7);
    pl.style.setProperty("--pl-d", `${Math.round(lensD)}px`);
    canvas.width = Math.round(D * dpr);
    canvas.height = Math.round(D * dpr);
    canvas.style.width = `${D}px`;
    canvas.style.height = `${D}px`;
    copy.style.width = `${D}px`;
    copy.style.height = `${D}px`;
    wavePlan();
    paint();
    paintPhoto();
    lens.wx = lens.wy = NaN;
  };

  /** The tone of the photograph under a point of the disc (0..1), for the lens's readout. */
  const lumAt = (x: number, y: number) => {
    if (!rawSide) return 0;
    const R = D / 2;
    const u = Math.min(rawSide - 1, Math.max(0, Math.round((x / R) * 0.5 * (rawSide - 1) + (rawSide - 1) / 2)));
    const v = Math.min(rawSide - 1, Math.max(0, Math.round((y / R) * 0.5 * (rawSide - 1) + (rawSide - 1) / 2)));
    return raw[v * rawSide + u];
  };

  // ── The lens: a window with a copy of the photograph, moved by whole-pixel translations ──
  const setOn = (on: boolean) => {
    if (on === lens.on) return;
    lens.on = on;
    if (on) {
      lens.placed = false;
      pl.setAttribute("data-on", "");
      figure.setAttribute("data-lens", "");
    } else {
      pl.removeAttribute("data-on");
      figure.removeAttribute("data-lens");
    }
  };

  /** Puts the lens's centre (disc coordinates, origin at the disc's centre) in place. */
  const place = (cx: number, cy: number, now: number) => {
    const R = D / 2;
    const X = Math.round(R + cx - lensD / 2);
    const Y = Math.round(R + cy - lensD / 2);
    if (X !== lens.wx || Y !== lens.wy) {
      lens.wx = X;
      lens.wy = Y;
      const t = `translate3d(${X}px,${Y}px,0)`;
      win.style.transform = t;
      ring.style.transform = t;
      copy.style.transform = `translate3d(${-X}px,${-Y}px,0)`;
    }
    if (now - lastLabel > LABEL_EVERY_MS) {
      lastLabel = now;
      label.textContent = `LUM ${String(Math.round(lumAt(cx, cy) * 100)).padStart(3, "0")}`;
    }
  };

  const aim = (tx: number, ty: number, dt: number, spring: boolean) => {
    const c = clampToDisc(tx, ty, D / 2);
    if (!lens.placed) {
      lens.x = { x: c.x, v: 0 };
      lens.y = { x: c.y, v: 0 };
      lens.placed = true;
    } else if (spring) {
      lens.x = stepSpring(lens.x, c.x, dt, LENS_SPRING);
      lens.y = stepSpring(lens.y, c.y, dt, LENS_SPRING);
    } else {
      lens.x = { x: c.x, v: 0 };
      lens.y = { x: c.y, v: 0 };
    }
    return c;
  };

  const drive: PortraitDots["drive"] = (x, y, dt, mode) => {
    if (!ready || disposed) return false;
    const R = D / 2;
    const fr = figure.getBoundingClientRect();
    const rx = x === null ? 0 : x - (fr.left + fr.width / 2);
    const ry = y - (fr.top + fr.height / 2);
    const near = x !== null && Math.hypot(rx, ry) <= R + lensD * 0.45;
    if (near && sweeping) {
      sweeping.stop();
      sweeping = null;
    }
    if (sweeping) return true;
    setOn(near);
    if (!near) return false;
    const c = aim(rx, ry, dt, mode.spring);
    place(lens.x.x, lens.y.x, performance.now());
    return mode.spring && !(atRest(lens.x, c.x, 0.2) && atRest(lens.y, c.y, 0.2));
  };

  const release = () => {
    if (sweeping) return;
    setOn(false);
  };

  // ── Coming in ────────────────────────────────────────────────────────────
  const develop: PortraitDots["develop"] = (delay) => {
    developed = true;
    return animate(0, 1, {
      duration: 2.3,
      ease: [0.45, 0, 0.2, 1],
      delay,
      onUpdate: (p) => setFront(waveFront(p, wave.travel, wave.band)),
      onComplete: arrive,
    });
  };

  /** A touch screen has no hover: once the dots are in, the lens takes one slow pass across the face. */
  const scheduleSweep = () => {
    // After the headline's own pass (3.8 s) on a touch screen, and only once the entrance is over.
    if (!options.sweep || swept || sweepTimer || html.hasAttribute("data-hero")) return;
    sweepTimer = window.setTimeout(startSweep, 4400);
  };
  const startSweep = () => {
    if (!options.sweep || swept || !ready || disposed) return;
    swept = true;
    const R = D / 2;
    setOn(true);
    const c = animate(0, 1, {
      duration: 3.2,
      ease: [0.45, 0, 0.2, 1],
      onUpdate: (u) => {
        const cx = -R * 0.55 + R * 1.1 * u;
        const cy = -R * 0.18 - Math.sin(u * Math.PI) * R * 0.12;
        lens.x = { x: cx, v: 0 };
        lens.y = { x: cy, v: 0 };
        lens.placed = true;
        place(cx, cy, performance.now());
      },
      onComplete: () => {
        sweeping = null;
        setOn(false);
      },
    });
    sweeping = { stop: () => c.stop() };
  };

  // ── Setup ────────────────────────────────────────────────────────────────
  const ro = new ResizeObserver(() => {
    if (ready) layout();
  });
  ro.observe(figure);

  const watch = new MutationObserver(() => {
    const nextLight = html.getAttribute("data-theme") === "light";
    if (nextLight !== light) {
      light = nextLight;
      palette = readPalette(root);
      if (ready) paint();
    }
    // The entrance's attribute went away: whatever it left unfinished (a cancelled run) is finished now.
    if (!html.hasAttribute("data-hero")) {
      if (!arrived) arrive();
      if (ready) scheduleSweep();
    }
  });
  watch.observe(html, { attributes: true, attributeFilter: ["data-theme", "data-hero"] });

  const prepare = async () => {
    try {
      if (!img.complete || !img.naturalWidth) {
        await new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        });
      }
      await img.decode().catch(() => undefined);
    } catch {
      /* the <img> stays as the portrait */
    }
    if (disposed || !img.naturalWidth) return;
    const file = new Image();
    file.src = img.currentSrc || img.src;
    try {
      await file.decode();
    } catch {
      return;
    }
    if (disposed) return;
    source = file;
    if (!sample()) return;
    ready = true;
    // If the page is already on screen (a rebuild, or no entrance), the dots are complete from the first frame.
    if (!html.hasAttribute("data-hero") && !developed && !arrived) arrive();
    figure.setAttribute("data-dots", "");
    layout();
    void document.fonts?.ready.then(() => {
      if (disposed) return;
      palette = readPalette(root);
      wavePlan();
    });
    scheduleSweep();
  };
  void prepare();

  return {
    develop,
    drive,
    release,
    dispose: () => {
      disposed = true;
      sweeping?.stop();
      window.clearTimeout(sweepTimer);
      ro.disconnect();
      watch.disconnect();
      pl.removeAttribute("data-on");
      figure.removeAttribute("data-dots");
      figure.removeAttribute("data-lens");
      canvas.setAttribute("data-in", "");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
  };
}
