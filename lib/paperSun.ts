/**
 * The light theme's paper is lit by the sun over Surabaya. Pure, so it can be tested: where the sun is
 * for a date and a place, and what the four steps of the paper ramp (the page, raised paper, sunken
 * paper, deep paper: --p0 .. --p3 in C0-nav-and-theme.css) look like at that hour.
 *
 * Noon is the stylesheet's own paper. Toward the horizon the paper warms (the same shift a low sun gives
 * to everything it lights); after dark it is dimmed and warmed further, like a sheet under a lamp. Never
 * lighter than at noon, so the page cannot become brighter than the one the theme was designed at, and the
 * ink on it stays legible (the tests hold the contrast against the dimmest paper).
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** The ramp at noon: raised, page, sunken, deep. The same four colours as the stylesheet. */
export const NOON_PAPER: readonly Rgb[] = [
  { r: 0xee, g: 0xe8, b: 0xda },
  { r: 0xe4, g: 0xdd, b: 0xcc },
  { r: 0xda, g: 0xd2, b: 0xbf },
  { r: 0xcf, g: 0xc6, b: 0xb0 },
];

const RAD = Math.PI / 180;

/**
 * Elevation of the sun above the horizon, in degrees, for a moment and a place (latitude north, longitude
 * east, both in degrees). The usual low-precision solar position (declination from the day of year, the
 * equation of time, the hour angle): good to a degree, which is more than a colour needs.
 */
export function solarElevation(date: Date, latitude: number, longitude: number): number {
  const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - startOfYear) / 86_400_000);
  const decl = 23.45 * Math.sin(RAD * (360 / 365) * (284 + dayOfYear));
  const b = RAD * (360 / 364) * (dayOfYear - 81);
  const equationOfTime = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b); // minutes
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const solarTime = utcHours + longitude / 15 + equationOfTime / 60;
  const hourAngle = 15 * (solarTime - 12);
  const sinElevation =
    Math.sin(RAD * latitude) * Math.sin(RAD * decl) + Math.cos(RAD * latitude) * Math.cos(RAD * decl) * Math.cos(RAD * hourAngle);
  return Math.asin(Math.max(-1, Math.min(1, sinElevation))) / RAD;
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** How warm (0..1) and how dim (0..1) the paper is when the sun is at this elevation. */
export function paperLight(elevation: number): { warmth: number; dim: number } {
  // Warm from high morning toward the horizon, fully warm once the sun is down.
  const warmth = 1 - smoothstep(-4, 30, elevation);
  // Dim from the horizon to deep night (-12 degrees is the end of nautical twilight).
  const dim = smoothstep(2, -12, elevation);
  return { warmth, dim };
}

/** The most the paper is dimmed (fraction of its own value) and tinted, at full night. */
const MAX_DIM = 0.06;
const WARM_TINT = { r: 1.0, g: 0.975, b: 0.92 };
const MAX_WARMTH = 0.6;

export function paperRamp(elevation: number): Rgb[] {
  const { warmth, dim } = paperLight(elevation);
  const k = 1 - MAX_DIM * dim;
  const w = MAX_WARMTH * warmth;
  const mul = {
    r: (1 + (WARM_TINT.r - 1) * w) * k,
    g: (1 + (WARM_TINT.g - 1) * w) * k,
    b: (1 + (WARM_TINT.b - 1) * w) * k,
  };
  return NOON_PAPER.map((c) => ({
    r: Math.round(c.r * mul.r),
    g: Math.round(c.g * mul.g),
    b: Math.round(c.b * mul.b),
  }));
}

export const toHex = (c: Rgb) => `#${[c.r, c.g, c.b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
export const toTriple = (c: Rgb) => `${c.r}, ${c.g}, ${c.b}`;
