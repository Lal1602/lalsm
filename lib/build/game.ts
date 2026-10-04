import { mulberry32 } from "../seededRandom";

/**
 * The PROBE demo's game, as a pure fixed-step simulation.
 *
 * `step(world, dt, input)` advances the world by exactly one tick (the page calls it
 * at a fixed 60Hz from an accumulator and draws between ticks), so how the game plays
 * does not depend on the display's refresh rate or on a slow frame. There is no DOM,
 * no clock and no Math.random: the same seed and the same inputs give the same run,
 * which is what the tests rely on.
 *
 * A probe slides along the bottom of a field while debris and energy shards fall
 * towards it. Shards score; debris costs a shield. It speeds up the longer you last.
 */

export const FIELD_W = 360;
export const FIELD_H = 420;
export const TICK = 1 / 60;

export const SHIP_Y = FIELD_H - 48;
export const SHIP_R = 10;
export const SHIELDS = 3;
const SHIP_SPEED = 260; // keyboard steering, px/s
const INVULN = 1.1; // seconds of grace after a hit
const POOL = 28;

export type Kind = 0 | 1; // 0 debris, 1 shard

export interface Obj {
  active: boolean;
  kind: Kind;
  x: number;
  y: number;
  /** y at the start of the tick, for drawing between ticks. */
  py: number;
  r: number;
  vy: number;
  drift: number;
  spin: number;
  angle: number;
  /** A stable per-object number the renderer can use to vary its shape. */
  seed: number;
}

export type GameEvent = { type: "shard" | "hit" | "over"; x: number; y: number };

export interface World {
  rand: () => number;
  t: number;
  tick: number;
  shipX: number;
  prevShipX: number;
  shield: number;
  shards: number;
  score: number;
  over: boolean;
  invuln: number;
  spawnIn: number;
  objs: Obj[];
  /** Drained by whoever draws (particles, shake); capped so an idle consumer cannot grow it. */
  events: GameEvent[];
}

export interface Input {
  /** Absolute x to steer towards (pointer / touch), or null. */
  targetX: number | null;
  /** -1, 0 or 1 from the keyboard. */
  dir: number;
}

const blank = (): Obj => ({
  active: false,
  kind: 0,
  x: 0,
  y: 0,
  py: 0,
  r: 0,
  vy: 0,
  drift: 0,
  spin: 0,
  angle: 0,
  seed: 0,
});

export function createWorld(seed: number): World {
  return {
    rand: mulberry32(seed),
    t: 0,
    tick: 0,
    shipX: FIELD_W / 2,
    prevShipX: FIELD_W / 2,
    shield: SHIELDS,
    shards: 0,
    score: 0,
    over: false,
    invuln: 0,
    spawnIn: 0.5,
    objs: Array.from({ length: POOL }, blank),
    events: [],
  };
}

/** 1 at the start, climbing to 3.2 over about a minute and a half. */
export function difficulty(t: number): number {
  return Math.min(3.2, 1 + t / 40);
}

/** Seconds between spawns at time t: shorter as it gets harder, never frantic. */
export function spawnGap(t: number): number {
  return Math.max(0.24, 0.78 - t * 0.011);
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function emit(w: World, e: GameEvent) {
  if (w.events.length < 32) w.events.push(e);
}

function spawn(w: World) {
  const o = w.objs.find((x) => !x.active);
  if (!o) return;
  const d = difficulty(w.t);
  const shard = w.rand() < 0.3;
  o.active = true;
  o.kind = shard ? 1 : 0;
  o.r = shard ? 6 : 8 + w.rand() * 9;
  o.x = o.r + w.rand() * (FIELD_W - o.r * 2);
  o.y = -o.r;
  o.py = o.y;
  o.vy = (shard ? 96 : 84 + w.rand() * 40) * d;
  o.drift = (w.rand() - 0.5) * 36;
  o.spin = (w.rand() - 0.5) * 3;
  o.angle = w.rand() * Math.PI * 2;
  o.seed = Math.floor(w.rand() * 1e6);
}

export function step(w: World, dt: number, input: Input): void {
  if (w.over) return;
  w.tick++;
  w.t += dt;
  w.prevShipX = w.shipX;

  // Steering. A pointer pulls the probe towards it (eased, so a jump of the finger is a
  // glide); the keyboard slides it. Either way it stays on the field.
  if (input.targetX !== null && Number.isFinite(input.targetX)) {
    const target = clamp(input.targetX, SHIP_R, FIELD_W - SHIP_R);
    w.shipX += (target - w.shipX) * Math.min(1, dt * 12);
  } else if (input.dir !== 0) {
    w.shipX += Math.sign(input.dir) * SHIP_SPEED * dt;
  }
  w.shipX = clamp(w.shipX, SHIP_R, FIELD_W - SHIP_R);

  w.invuln = Math.max(0, w.invuln - dt);

  w.spawnIn -= dt;
  if (w.spawnIn <= 0) {
    spawn(w);
    w.spawnIn += spawnGap(w.t);
  }

  for (const o of w.objs) {
    if (!o.active) continue;
    o.py = o.y;
    o.y += o.vy * dt;
    o.x += o.drift * dt;
    o.angle += o.spin * dt;
    if (o.x < o.r || o.x > FIELD_W - o.r) o.drift = -o.drift;

    if (o.y - o.r > FIELD_H) {
      o.active = false;
      continue;
    }

    const dx = o.x - w.shipX;
    const dy = o.y - SHIP_Y;
    const reach = o.r + (o.kind === 1 ? SHIP_R + 4 : SHIP_R - 2);
    if (dx * dx + dy * dy > reach * reach) continue;

    if (o.kind === 1) {
      o.active = false;
      w.shards++;
      emit(w, { type: "shard", x: o.x, y: o.y });
    } else if (w.invuln === 0) {
      o.active = false;
      w.shield--;
      w.invuln = INVULN;
      emit(w, { type: "hit", x: w.shipX, y: SHIP_Y });
      if (w.shield <= 0) {
        w.over = true;
        emit(w, { type: "over", x: w.shipX, y: SHIP_Y });
      }
    }
  }

  w.score = w.shards * 10 + Math.floor(w.t);
}
