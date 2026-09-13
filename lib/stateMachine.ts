/**
 * stateMachine — a small blended state machine, modelled on Rive's.
 *
 * Named states hold a set of numeric channels. Transitions between them are
 * declared with conditions over typed inputs (boolean / number / trigger), and
 * the runtime interpolates the channels rather than snapping them.
 *
 * The part that earns the name is the blending. On entering a transition the
 * runtime snapshots the *live* channel values as the `from` set, not the
 * nominal values of the state being left. A transition interrupted at 40%
 * therefore continues from exactly where it was, so sweeping a pointer across
 * several targets produces genuinely mixed intermediate poses instead of a
 * series of restarts. That is the whole reason this exists in place of five
 * separate CSS transitions.
 *
 * Triggers behave as Rive's do: fire() raises a flag that the next condition
 * evaluation consumes, then it resets itself. A fired trigger also starts its
 * `pulses` entry — an additive 0 → 1 → 0 envelope the caller can layer on top
 * of the state blend.
 *
 * Perf: this module owns exactly one rAF, shared by every machine, and it is
 * on-demand. It starts on the first registration and stops on the frame every
 * registered tick reports itself settled — the page is compositing-bound and
 * LenisSetup documents what a permanently parked ticker costs while idle. The
 * settle-then-stop discipline is the one already measured in ContactSection.
 */

export type Channels = Record<string, number>;

export type InputType = "boolean" | "number" | "trigger";

export type ConditionOp = "isTrue" | "isFalse" | "fired" | "gte" | "lte";

export interface Condition {
  input: string;
  op: ConditionOp;
  /** Compared against, for gte / lte. */
  value?: number;
}

export interface TransitionDef {
  /** "*" matches any state. */
  from: string | "*";
  to: string;
  /** Every condition must hold. */
  when: Condition[];
  duration: number;
  ease?: (t: number) => number;
}

export interface InputDef {
  type: InputType;
  value?: number | boolean;
}

export interface PulseDef {
  duration: number;
  ease?: (t: number) => number;
}

export interface MachineDef {
  initial: string;
  inputs: Record<string, InputDef>;
  /** state name → channel target values. Every state must list every channel. */
  states: Record<string, Channels>;
  /** One-shot envelopes started by a trigger of the same name. */
  pulses?: Record<string, PulseDef>;
  /** Evaluated in order; the first whose conditions all hold wins. */
  transitions: TransitionDef[];
}

export interface Machine {
  readonly state: string;
  /** Blended state values. Mutated in place each frame — do not hold a copy. */
  readonly channels: Channels;
  /** Live 0 → 1 → 0 envelopes, keyed by trigger name. */
  readonly pulses: Channels;
  setBool(name: string, v: boolean): void;
  setNumber(name: string, v: number): void;
  getNumber(name: string): number;
  fire(name: string): void;
  /** Steps time forward. Returns true while anything is still moving. */
  advance(dt: number): boolean;
  /** Jump straight to the current state's values and drop every envelope. */
  snap(): void;
}

/* ── Easing ───────────────────────────────────────────────────────────────
   Named to match the GSAP curves used elsewhere in this codebase so the two
   halves of the section move alike. */

export const ease = {
  linear: (t: number) => t,
  power2Out: (t: number) => 1 - Math.pow(1 - t, 2),
  power2InOut: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  power3Out: (t: number) => 1 - Math.pow(1 - t, 3),
  /** Rises and falls once — the shape a one-shot pulse wants. */
  arch: (t: number) => Math.sin(t * Math.PI),
};

/* ── The machine ──────────────────────────────────────────────────────────── */

export function createMachine(def: MachineDef): Machine {
  const channelNames = Object.keys(def.states[def.initial] ?? {});

  const channels: Channels = {};
  const from: Channels = {};
  const pulses: Channels = {};

  for (const k of channelNames) {
    channels[k] = def.states[def.initial][k] ?? 0;
    from[k] = channels[k];
  }

  const bools: Record<string, boolean> = {};
  const numbers: Record<string, number> = {};
  const fired: Record<string, boolean> = {};

  for (const [name, input] of Object.entries(def.inputs)) {
    if (input.type === "boolean") bools[name] = Boolean(input.value);
    else if (input.type === "number") numbers[name] = Number(input.value ?? 0);
    else fired[name] = false;
  }

  // Active pulse envelopes: trigger name → elapsed ms.
  const pulseClock: Record<string, number> = {};
  for (const name of Object.keys(def.pulses ?? {})) pulses[name] = 0;

  let state = def.initial;
  let elapsed = 0;
  let duration = 0;
  let curve: (t: number) => number = ease.linear;

  const holds = (c: Condition): boolean => {
    switch (c.op) {
      case "isTrue":
        return bools[c.input] === true;
      case "isFalse":
        return bools[c.input] === false;
      case "fired":
        return fired[c.input] === true;
      case "gte":
        return numbers[c.input] >= (c.value ?? 0);
      case "lte":
        return numbers[c.input] <= (c.value ?? 0);
      default:
        return false;
    }
  };

  const enter = (to: string, ms: number, curveFn: (t: number) => number) => {
    // Snapshot where the channels actually are, not where the state we are
    // leaving says they should be. This is what makes an interrupted
    // transition blend instead of restart.
    for (const k of channelNames) from[k] = channels[k];
    state = to;
    elapsed = 0;
    duration = Math.max(0, ms);
    curve = curveFn;
    if (duration === 0) {
      const target = def.states[state];
      for (const k of channelNames) channels[k] = target[k] ?? 0;
    }
  };

  const evaluate = () => {
    for (const t of def.transitions) {
      if (t.from !== "*" && t.from !== state) continue;
      if (t.to === state) continue;
      let ok = true;
      for (const c of t.when) {
        if (!holds(c)) {
          ok = false;
          break;
        }
      }
      if (ok) {
        enter(t.to, t.duration, t.ease ?? ease.power2Out);
        return;
      }
    }
  };

  return {
    get state() {
      return state;
    },
    channels,
    pulses,

    setBool(name, v) {
      bools[name] = v;
    },
    setNumber(name, v) {
      numbers[name] = v;
    },
    getNumber(name) {
      return numbers[name] ?? 0;
    },
    fire(name) {
      if (name in fired) fired[name] = true;
      if (def.pulses && name in def.pulses) pulseClock[name] = 0;
    },

    advance(dt) {
      evaluate();
      // Triggers survive exactly one evaluation, then reset themselves.
      for (const name of Object.keys(fired)) fired[name] = false;

      let moving = false;

      if (duration > 0 && elapsed < duration) {
        elapsed = Math.min(duration, elapsed + dt);
        const t = curve(elapsed / duration);
        const target = def.states[state];
        for (const k of channelNames) {
          channels[k] = from[k] + ((target[k] ?? 0) - from[k]) * t;
        }
        if (elapsed < duration) moving = true;
        else for (const k of channelNames) channels[k] = target[k] ?? 0;
      }

      for (const [name, pulse] of Object.entries(def.pulses ?? {})) {
        if (!(name in pulseClock)) continue;
        pulseClock[name] += dt;
        if (pulseClock[name] >= pulse.duration) {
          pulses[name] = 0;
          delete pulseClock[name];
        } else {
          pulses[name] = (pulse.ease ?? ease.arch)(pulseClock[name] / pulse.duration);
          moving = true;
        }
      }

      return moving;
    },

    snap() {
      const target = def.states[state];
      for (const k of channelNames) {
        channels[k] = target[k] ?? 0;
        from[k] = channels[k];
      }
      elapsed = duration;
      for (const name of Object.keys(pulses)) {
        pulses[name] = 0;
        delete pulseClock[name];
      }
    },
  };
}

/* ── The shared loop ──────────────────────────────────────────────────────
   One rAF for every machine on the page, started on the first registration and
   stopped the moment every tick reports itself settled. Nothing is scheduled
   while the section sits idle. */

type Tick = (dt: number) => boolean;

const ticks = new Set<Tick>();
let frame = 0;
let last = 0;

const run = (now: number) => {
  // Clamp: a backgrounded tab hands back a huge delta on the first frame, which
  // would jump every transition straight to its end.
  const dt = Math.min(64, now - last);
  last = now;

  let alive = false;
  for (const tick of ticks) {
    if (tick(dt)) alive = true;
  }

  frame = alive ? requestAnimationFrame(run) : 0;
};

/** Registers a per-frame callback. Returns its unregister function. */
export function register(tick: Tick): () => void {
  ticks.add(tick);
  wake();
  return () => {
    ticks.delete(tick);
    if (ticks.size === 0 && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };
}

/** Restarts the loop after it has settled. Safe to call when already running. */
export function wake(): void {
  if (frame || ticks.size === 0) return;
  last = performance.now();
  frame = requestAnimationFrame(run);
}
