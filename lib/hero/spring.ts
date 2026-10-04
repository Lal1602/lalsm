/**
 * A damped spring for one number, stepped by hand so the hero's pointer loop can run a few dozen of
 * them in one requestAnimationFrame without a motion value each. Semi-implicit Euler in small
 * sub-steps, which stays stable for stiff springs and long frames (a hidden tab returning, a hitch).
 */

export interface SpringState {
  x: number;
  v: number;
}

export interface SpringConfig {
  stiffness: number;
  damping: number;
  mass?: number;
}

/** Longest single step; a frame longer than this is simulated as several. */
const SUB_STEP = 1 / 120;
/** A frame longer than this is treated as this long (a hitch must not fling things across the screen). */
const MAX_DT = 1 / 20;

export function stepSpring(state: SpringState, target: number, dt: number, config: SpringConfig): SpringState {
  const { stiffness, damping, mass = 1 } = config;
  if (!Number.isFinite(dt) || dt <= 0) return state;
  let { x, v } = state;
  let remaining = Math.min(dt, MAX_DT);
  while (remaining > 1e-9) {
    const h = Math.min(SUB_STEP, remaining);
    const a = (stiffness * (target - x) - damping * v) / mass;
    v += a * h;
    x += v * h;
    remaining -= h;
  }
  return { x, v };
}

export function atRest(state: SpringState, target: number, epsilon = 0.02): boolean {
  return Math.abs(state.x - target) < epsilon && Math.abs(state.v) < epsilon;
}
