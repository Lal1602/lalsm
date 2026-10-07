/**
 * Pure decision logic for the runtime quality governor — no DOM, so it can be
 * unit-tested with synthetic frame times.
 *
 * Tiers run 0 (best) to 3 (leanest). Effects never disappear at any tier; what
 * changes is how much they cost: render resolution, shader octaves, particle
 * counts. The governor only moves when the evidence is sustained, and it
 * remembers where it failed so it does not bounce between two tiers forever.
 */

export type QualityTier = 0 | 1 | 2 | 3;

export interface GovernorOptions {
  /** Frames at or above this many ms count as "slow". 60 fps is 16.7ms. */
  slowFrameMs?: number;
  /** Evaluate a window after this many ms of sampled frames. */
  windowMs?: number;
  /** Share of slow frames in a window that triggers a step down. */
  downShare?: number;
  /** Share of slow frames below which a window counts as clean. */
  upShare?: number;
  /** Clean windows in a row required before stepping back up. */
  upWindows?: number;
  /** Minimum ms between two tier changes. */
  cooldownMs?: number;
  initialTier?: QualityTier;
}

const DEFAULTS: Required<GovernorOptions> = {
  slowFrameMs: 24,
  windowMs: 2000,
  downShare: 0.22,
  upShare: 0.02,
  upWindows: 5,
  cooldownMs: 4000,
  initialTier: 0,
};

/** Frames longer than this are tab switches or breakpoints, not performance. */
const IGNORE_ABOVE_MS = 250;

export class QualityGovernor {
  private opts: Required<GovernorOptions>;
  tier: QualityTier;
  /** The best tier we are still willing to try, lowered when a tier failed. */
  private ceiling: QualityTier = 0;

  private windowStart = -1;
  private frames = 0;
  private slow = 0;
  private cleanWindows = 0;
  private lastChange = -Infinity;

  constructor(options: GovernorOptions = {}) {
    this.opts = { ...DEFAULTS, ...options };
    this.tier = this.opts.initialTier;
  }

  /**
   * Feed one frame. `now` is a monotonic timestamp in ms, `delta` the time
   * since the previous frame. Returns the new tier when it changed.
   */
  push(delta: number, now: number): QualityTier | null {
    if (delta <= 0 || delta > IGNORE_ABOVE_MS) return null;
    if (this.windowStart < 0) this.windowStart = now;

    this.frames += 1;
    if (delta >= this.opts.slowFrameMs) this.slow += 1;

    if (now - this.windowStart < this.opts.windowMs) return null;

    const share = this.frames > 10 ? this.slow / this.frames : 0;
    const enough = this.frames > 10;
    this.windowStart = now;
    this.frames = 0;
    this.slow = 0;
    if (!enough) return null;

    const coolingDown = now - this.lastChange < this.opts.cooldownMs;

    if (share >= this.opts.downShare) {
      this.cleanWindows = 0;
      if (coolingDown || this.tier >= 3) return null;
      // The tier we are leaving was not good enough: do not climb back to it
      // until the page has proved itself much longer.
      this.ceiling = Math.min(3, this.tier + 1) as QualityTier;
      return this.move((this.tier + 1) as QualityTier, now);
    }

    if (share <= this.opts.upShare) {
      this.cleanWindows += 1;
      const needed = this.opts.upWindows + (this.tier <= this.ceiling ? 4 : 0);
      if (this.tier > 0 && this.tier - 1 >= 0 && this.cleanWindows >= needed && !coolingDown) {
        this.cleanWindows = 0;
        return this.move((this.tier - 1) as QualityTier, now);
      }
    } else {
      this.cleanWindows = 0;
    }
    return null;
  }

  private move(next: QualityTier, now: number): QualityTier {
    this.tier = next;
    this.lastChange = now;
    this.cleanWindows = 0;
    return next;
  }
}

/** What each tier means for the effects that read it. */
export interface QualityPreset {
  /** Cap for devicePixelRatio on full-viewport WebGL. */
  dpr: number;
  /** Resolution multiplier for the shared nebula renderer. */
  nebulaScale: number;
  /** fbm octaves in the nebula shader. */
  nebulaOctaves: number;
  /** Frame cap for ambient (non-interactive) animation. Slow drift needs no more. */
  idleFps: number;
  /** Frame cap for the pointer's push on the nebula, which is interactive and so runs well above the ambient rate. */
  lensFps: number;
  /** Multiplier on particle counts. */
  particles: number;
  /** Resolution multiplier for the Horizon tube background (a soft glow, so it takes less before it shows). */
  tubeScale: number;
}

export const QUALITY_PRESETS: Record<QualityTier, QualityPreset> = {
  0: { dpr: 1.5, nebulaScale: 0.46, nebulaOctaves: 3, idleFps: 12, lensFps: 60, particles: 1, tubeScale: 1 },
  1: { dpr: 1.25, nebulaScale: 0.4, nebulaOctaves: 3, idleFps: 12, lensFps: 60, particles: 0.8, tubeScale: 0.85 },
  2: { dpr: 1, nebulaScale: 0.32, nebulaOctaves: 2, idleFps: 10, lensFps: 40, particles: 0.55, tubeScale: 0.7 },
  3: { dpr: 1, nebulaScale: 0.26, nebulaOctaves: 2, idleFps: 8, lensFps: 30, particles: 0.35, tubeScale: 0.55 },
};
