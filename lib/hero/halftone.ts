/**
 * The portrait as a field of dots. Everything that can be worked out without a canvas lives here, so
 * it can be tested: where the dots sit, how a photograph's tones become dot sizes, how the wave of
 * light moves on the way in, and where the lens may go. The canvas code only draws what these return.
 */

/**
 * The part of the photograph that is shown, as fractions of the image: a square of side `s` centred at
 * (`cx`, `cy`). The portrait is a disc, so the corners of this square are never seen.
 */
export const CROP = { cx: 0.5, cy: 0.32, s: 0.56 } as const;

/** Dots across the disc's diameter. */
export const COLS = 76;

/** Samples of the photograph per dot, along one side. */
export const OVERSAMPLE = 3;

export interface DotGrid {
  n: number;
  /** Centres in units of the disc's radius: the disc is the unit circle. */
  x: Float32Array;
  y: Float32Array;
  /** The distance between neighbouring centres, in the same units. */
  pitch: number;
}

/**
 * A staggered (hexagonal) lattice of dots, the way a halftone screen is laid out: rows `pitch * sqrt(3)/2`
 * apart, every other row shifted by half a pitch, so each dot has six equal neighbours. Only dots that
 * fit whole inside the disc are kept, so the rim is clean.
 */
export function hexGrid(cols: number): DotGrid {
  const pitch = 2 / cols;
  const rowStep = (pitch * Math.sqrt(3)) / 2;
  const limit = 1 - pitch * 0.5;
  const xs: number[] = [];
  const ys: number[] = [];
  const rows = Math.floor(2 / rowStep) + 1;
  for (let j = 0; j < rows; j++) {
    const y = (j - (rows - 1) / 2) * rowStep;
    // Odd rows sit half a pitch to the right of even ones; the shift is split either side of the centre so the lattice is symmetric.
    const shift = (j % 2 === 0 ? -1 : 1) * (pitch / 4);
    for (let i = 0; i <= cols; i++) {
      const x = (i - cols / 2) * pitch + shift;
      if (Math.hypot(x, y) <= limit) {
        xs.push(x);
        ys.push(y);
      }
    }
  }
  return { n: xs.length, x: Float32Array.from(xs), y: Float32Array.from(ys), pitch };
}

/** Rec. 709 luma of a gamma-encoded pixel, 0..1. */
export function luma(r: number, g: number, b: number): number {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/** Average of each value's neighbourhood (a square, `radius` each way) in a square image, by running sums: linear in the pixel count. */
export function boxBlur(values: Float32Array, side: number, radius: number): Float32Array {
  const r = Math.max(1, Math.round(radius));
  const tmp = new Float32Array(values.length);
  const out = new Float32Array(values.length);
  for (let y = 0; y < side; y++) {
    let sum = 0;
    let count = 0;
    const row = y * side;
    for (let x = 0; x <= Math.min(r, side - 1); x++) {
      sum += values[row + x];
      count++;
    }
    for (let x = 0; x < side; x++) {
      tmp[row + x] = sum / count;
      const add = x + r + 1;
      const drop = x - r;
      if (add < side) {
        sum += values[row + add];
        count++;
      }
      if (drop >= 0) {
        sum -= values[row + drop];
        count--;
      }
    }
  }
  for (let x = 0; x < side; x++) {
    let sum = 0;
    let count = 0;
    for (let y = 0; y <= Math.min(r, side - 1); y++) {
      sum += tmp[y * side + x];
      count++;
    }
    for (let y = 0; y < side; y++) {
      out[y * side + x] = sum / count;
      const add = y + r + 1;
      const drop = y - r;
      if (add < side) {
        sum += tmp[add * side + x];
        count++;
      }
      if (drop >= 0) {
        sum -= tmp[drop * side + x];
        count--;
      }
    }
  }
  return out;
}

/** How the photograph's tones are brought out, in fractions of the sample image's side. */
export const LOCAL = { radius: 0.09, k: 1, keep: 0.45 } as const;

/**
 * Local normalisation: each value is taken as a number of local deviations above or below the average
 * of its own neighbourhood, so a mid tone against a mid tone (the face against the hair and the wall)
 * comes out as light against dark instead of vanishing into the field. `keep` lets part of the
 * original large-scale brightness back, so the wall is still lighter than the door.
 */
export function localNormalise(values: Float32Array, side: number, radius: number, k: number, keep: number): Float32Array {
  const mean = boxBlur(values, side, radius);
  const dev2 = new Float32Array(values.length);
  for (let i = 0; i < values.length; i++) dev2[i] = (values[i] - mean[i]) ** 2;
  const variance = boxBlur(dev2, side, radius);
  const out = new Float32Array(values.length);
  for (let i = 0; i < values.length; i++) {
    const deviation = Math.sqrt(Math.max(1e-5, variance[i]));
    out[i] = 0.5 + (0.28 * (values[i] - mean[i])) / (deviation * k + 0.02) + keep * (mean[i] - 0.5);
  }
  return out;
}

/** The values at the given fractions of the sorted list: how dark is "black" and how light is "white" in this photograph. */
export function percentiles(values: ArrayLike<number>, lo: number, hi: number): { lo: number; hi: number } {
  const sorted = Array.from(values).sort((a, b) => a - b);
  if (sorted.length === 0) return { lo: 0, hi: 1 };
  const at = (p: number) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.round(p * (sorted.length - 1))))];
  const a = at(lo);
  const b = at(hi);
  return b - a < 1e-6 ? { lo: a, hi: a + 1 } : { lo: a, hi: b };
}

/** A value stretched between the photograph's own black and white, then eased a little so mid tones carry. */
export function stretch(value: number, levels: { lo: number; hi: number }, gamma = 1): number {
  const t = Math.min(1, Math.max(0, (value - levels.lo) / (levels.hi - levels.lo)));
  return t ** gamma;
}

/**
 * Dot radius for a tone, as a fraction of the pitch. Area follows tone (radius is its square root), so
 * the ink on the page is proportional to the light in the photograph; a dot too small to print is left out.
 * `MAX` is a touch under half a pitch, so full tone nearly meets its neighbours without merging into a sheet.
 */
export const DOT_MAX = 0.5;
export const DOT_MIN = 0.07;

export function dotRadius(tone: number): number {
  const t = Math.min(1, Math.max(0, tone));
  const r = Math.sqrt(t) * DOT_MAX;
  return r < DOT_MIN ? 0 : r;
}

/** 0 (dim), 1 (mid) or 2 (highlight): which of the three inks a tone is printed in. */
export function inkOf(tone: number): 0 | 1 | 2 {
  return tone < 0.34 ? 0 : tone < 0.72 ? 1 : 2;
}

/**
 * Where the front of the wave of light is, in px, for an entrance progress 0..1: the dots come in as the
 * front passes over them. It runs from the full stop outward until the far side of the disc has been
 * passed by the whole of the band (the soft edge between "not yet" and "arrived").
 */
export function waveFront(progress: number, travel: number, band: number): number {
  return Math.min(1, Math.max(0, progress)) * (travel + band);
}

/** The lens's diameter: the same as the headline's (clamp(124px, 11vw, 190px)), and 120px on a phone. */
export function lensDiameter(viewportWidth: number): number {
  if (viewportWidth <= 860) return 120;
  return Math.min(190, Math.max(124, viewportWidth * 0.11));
}

/** Keeps the lens's centre inside the disc (plus a little), so it can reach the rim but not wander off. */
export function clampToDisc(x: number, y: number, radius: number): { x: number; y: number } {
  const d = Math.hypot(x, y);
  if (d <= radius) return { x, y };
  const k = radius / d;
  return { x: x * k, y: y * k };
}
