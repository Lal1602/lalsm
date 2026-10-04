/**
 * Pure geometry for the Observatory Plates gallery. Nothing here touches the DOM or
 * WebGL, so it can be tested, and the vertex shader (shaders.ts) mirrors platePose()
 * line for line: the GPU draws what this file says is where a plate is, which is
 * also what the click handler hit-tests against.
 *
 * Space: css pixels, origin at the top-left of the stage, y down. `o` is a plate's
 * offset from the focused position in plate units (0 = centred, +1 = the next one).
 */

/** How many plate instances are drawn at once. Only the middle three are ever on screen. */
export const SLOTS = 6;
/** Plates are laid out this many slots before the focused one. */
export const SLOT_BEFORE = 2;

/** Width of the dark glass frame around the image, css px at scale 1. */
export const FRAME = 10;

export interface Pose {
  /** Centre x relative to the stage centre. */
  x: number;
  /** Centre y relative to the stage centre (plates hang lower the further out they are). */
  y: number;
  scale: number;
  /** Radians, clockwise. */
  tilt: number;
  /** 1 when centred, 0 from one slot away. Drives focus: sharp, bright, developed. */
  focus: number;
}

export const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function wrapIndex(i: number, n: number): number {
  return ((Math.round(i) % n) + n) % n;
}

export function platePose(o: number, plateW: number, plateH: number, pitch: number): Pose {
  const a = Math.abs(o);
  const scale = lerp(lerp(1, 0.78, smooth(0, 1, a)), 0.66, smooth(1, 2, a));
  return {
    x: o * pitch,
    y: a * a * plateH * 0.07,
    scale,
    tilt: o * 0.045,
    focus: 1 - smooth(0, 1, a),
  };
}

export interface PlateSize {
  plateW: number;
  plateH: number;
  pitch: number;
  stageH: number;
}

/**
 * Plate and stage dimensions for a stage `cssW` wide. The image area is 2:1, which
 * is what the atlas cells hold, so it is never stretched.
 */
export function plateSize(cssW: number): PlateSize {
  const narrow = cssW < 700;
  const plateW = Math.round(narrow ? Math.min(cssW * 0.74, 360) : Math.min(Math.max(cssW * 0.4, 300), 620));
  const plateH = Math.round((plateW - FRAME * 2) / 2 + FRAME * 2);
  return {
    plateW,
    plateH,
    // Neighbours are 0.78 scale, so this leaves a small gap and they never overlap.
    pitch: Math.round(plateW * 0.95),
    stageH: Math.round(plateH + (narrow ? 84 : 132)),
  };
}

/** Which project the plate at integer position `i` shows. */
export const projectAt = wrapIndex;

/** Atlas cell for a project, as fractions of the atlas. Row 0 is the top. */
export function atlasCell(index: number, cols: number, rows: number) {
  const col = index % cols;
  const row = Math.floor(index / cols);
  return { u0: col / cols, v0: row / rows, u1: (col + 1) / cols, v1: (row + 1) / rows, col, row };
}

export function atlasRows(count: number, cols: number): number {
  return Math.max(1, Math.ceil(count / cols));
}

export interface HitInput {
  /** Pointer in stage css px. */
  x: number;
  y: number;
  stageW: number;
  stageH: number;
  /** Focused position (float: where the rail currently is). */
  pos: number;
  count: number;
  plateW: number;
  plateH: number;
  pitch: number;
}

/**
 * The plate under a point: its absolute rail position (an integer, which can be
 * passed straight to goTo) and the project it shows, or null for empty space.
 * Checks the most focused plates first, since they are drawn largest.
 */
export function hitPlate(h: HitInput): { rail: number; project: number } | null {
  const base = Math.floor(h.pos) - SLOT_BEFORE;
  let best: { rail: number; project: number; focus: number } | null = null;
  for (let k = 0; k < SLOTS; k++) {
    const rail = base + k;
    const o = rail - h.pos;
    const pose = platePose(o, h.plateW, h.plateH, h.pitch);
    const cx = h.stageW / 2 + pose.x;
    const cy = h.stageH / 2 + pose.y;
    // Into the plate's own frame: translate, then undo the tilt.
    const dx = h.x - cx;
    const dy = h.y - cy;
    const c = Math.cos(-pose.tilt);
    const s = Math.sin(-pose.tilt);
    const lx = dx * c - dy * s;
    const ly = dx * s + dy * c;
    if (Math.abs(lx) <= (h.plateW * pose.scale) / 2 && Math.abs(ly) <= (h.plateH * pose.scale) / 2) {
      if (!best || pose.focus > best.focus) best = { rail, project: projectAt(rail, h.count), focus: pose.focus };
    }
  }
  return best ? { rail: best.rail, project: best.project } : null;
}

/** Where a released drag should come to rest: the nearest plate, nudged by its momentum. */
export function snapTarget(pos: number, velocity: number): number {
  return Math.round(pos + velocity * 0.18);
}

/**
 * One step of a critically damped spring toward `target`, in plate units. Done in
 * small sub-steps so a long frame (a busy page) cannot overshoot or blow up.
 */
export function springStep(pos: number, vel: number, target: number, dt: number, stiffness = 120, damping = 22) {
  let p = pos;
  let v = vel;
  let remaining = Math.min(dt, 0.1);
  while (remaining > 0) {
    const h = Math.min(remaining, 1 / 240);
    v += (stiffness * (target - p) - damping * v) * h;
    p += v * h;
    remaining -= h;
  }
  return { pos: p, vel: v };
}

/** The shortest way to reach plate `index` from rail position `pos`, as an absolute rail position. */
export function railTarget(pos: number, index: number, count: number): number {
  const here = wrapIndex(pos, count);
  let delta = index - here;
  if (delta > count / 2) delta -= count;
  if (delta < -count / 2) delta += count;
  return Math.round(pos) + delta;
}
