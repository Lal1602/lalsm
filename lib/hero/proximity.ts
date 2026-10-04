/**
 * How the headline's letters answer the pointer. Pure, so the feel can be tuned and tested without a
 * browser: given where a letter is relative to the pointer, how far it lifts, leans and tilts.
 */

export interface LetterOffset {
  /** Horizontal shift in px (toward the pointer). */
  x: number;
  /** Vertical shift in px (negative lifts the letter). */
  y: number;
  /** Tilt in degrees (leaning toward the pointer). */
  r: number;
}

export interface ProximityOptions {
  /** Distance in px beyond which a letter does not notice the pointer. */
  radius?: number;
  /** Peak lift in px. */
  lift?: number;
  /** Peak sideways pull toward the pointer in px. */
  pull?: number;
  /** Peak lean in degrees. */
  lean?: number;
}

const ZERO: LetterOffset = { x: 0, y: 0, r: 0 };

/** 1 at the pointer, 0 at `radius` and beyond, with no kink at either end. */
export function falloff(distance: number, radius: number): number {
  if (!(radius > 0) || !Number.isFinite(distance)) return 0;
  const t = Math.min(1, Math.max(0, distance / radius));
  const inv = 1 - t;
  return inv * inv * (3 - 2 * inv);
}

/**
 * `dx`, `dy`: the pointer's position minus the letter's centre, in px.
 * The letter rises a little, leans toward the pointer and is pulled slightly toward it, most when the
 * pointer is close, and not at all beyond the radius.
 */
export function letterOffset(dx: number, dy: number, options: ProximityOptions = {}): LetterOffset {
  const { radius = 260, lift = 7, pull = 3.5, lean = 2.2 } = options;
  const distance = Math.hypot(dx, dy);
  const f = falloff(distance, radius);
  if (f === 0 || !Number.isFinite(f)) return { ...ZERO };
  const side = Math.max(-1, Math.min(1, dx / radius));
  return {
    x: side * pull * f,
    y: -lift * f,
    r: side * lean * f,
  };
}

/** Scale of a ruler tick `distance` px from the pointer: grows toward `max`, back to 1 at `radius`. */
export function rulerScale(distance: number, radius = 90, max = 2.2): number {
  return 1 + (max - 1) * falloff(distance, radius);
}
