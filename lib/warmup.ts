/**
 * Warm-up pipeline: everything expensive that a section needs the first time it
 * appears (WebGL context, shader compilation, texture decode and upload) is done
 * while the preloader is on screen, so arriving at the section is just an
 * animation and never a stall.
 *
 * A task is `run(): Promise<value>`. Its value is kept so the section can adopt
 * the finished work (`warmValue`) instead of redoing it. Every task has a
 * timeout: on a slow device the preloader moves on and the section falls back to
 * doing its own setup, rather than the visitor waiting on a spinner.
 *
 * Tasks run in parallel, except those in the `gpu` lane: they are the ones that
 * hold the main thread for tens of milliseconds at a time (a shader compile, an
 * atlas upload, a first draw), so they run one after another with a frame between
 * them. The screen in front keeps painting between the blocks instead of freezing
 * for the sum of them.
 */

export interface WarmupTask {
  name: string;
  run: () => Promise<unknown>;
  /** Give up waiting after this long, counted from when the task starts. Default 6000ms. */
  timeoutMs?: number;
  /** Its share of the progress readout (about its cost). Default 1. */
  weight?: number;
  /** "gpu": runs alone, in registration order, with a frame of breathing room after it. */
  lane?: "gpu";
}

export type WarmupStatus = "pending" | "ok" | "timeout" | "error";

export interface WarmupSnapshot {
  total: number;
  /** Tasks that have settled one way or another. */
  settled: number;
  started: boolean;
  finished: boolean;
  /** 0..1, by weight. */
  progress: number;
  /** The task that settled last, for a readout. */
  last: { name: string; status: WarmupStatus } | null;
}

const DEFAULT_TIMEOUT = 6000;
const FRAME_BREAK_MS = 64;

const tasks = new Map<string, WarmupTask>();
const status = new Map<string, WarmupStatus>();
const values = new Map<string, unknown>();
const waiters = new Map<string, Array<(value: unknown) => void>>();
const listeners = new Set<() => void>();
const laneQueue: WarmupTask[] = [];

let started = false;
let finished = false;
let finishPromise: Promise<void> | null = null;
let laneRun: Promise<void> | null = null;
let last: WarmupSnapshot["last"] = null;
let snapshot: WarmupSnapshot = { total: 0, settled: 0, started: false, finished: false, progress: 0, last: null };

const weightOf = (t: WarmupTask) => Math.max(0, t.weight ?? 1);

function publish() {
  const total = tasks.size;
  let settled = 0;
  let weight = 0;
  let weightSettled = 0;
  tasks.forEach((t, name) => {
    const w = weightOf(t);
    weight += w;
    if (status.get(name) !== "pending") {
      settled += 1;
      weightSettled += w;
    }
  });
  snapshot = {
    total,
    settled,
    started,
    finished,
    progress: weight === 0 ? (finished ? 1 : 0) : weightSettled / weight,
    last,
  };
  listeners.forEach((l) => l());
}

export function registerWarmup(task: WarmupTask): void {
  if (tasks.has(task.name)) return;
  tasks.set(task.name, task);
  status.set(task.name, "pending");
  publish();
  // Registered after the run began (a lazily loaded module): start it now.
  if (started && !finished) {
    if (task.lane === "gpu") {
      laneQueue.push(task);
      void pumpLane();
    } else void runOne(task);
  }
}

function settle(name: string, result: WarmupStatus, value?: unknown) {
  if (status.get(name) !== "pending") return;
  status.set(name, result);
  last = { name, status: result };
  if (result === "ok") {
    values.set(name, value);
    waiters.get(name)?.forEach((w) => w(value));
  } else {
    waiters.get(name)?.forEach((w) => w(undefined));
  }
  waiters.delete(name);
  publish();
}

async function runOne(task: WarmupTask): Promise<void> {
  const timeout = new Promise<"timeout">((resolve) =>
    setTimeout(() => resolve("timeout"), task.timeoutMs ?? DEFAULT_TIMEOUT),
  );
  try {
    const outcome = await Promise.race([task.run(), timeout]);
    if (outcome === "timeout") settle(task.name, "timeout");
    else settle(task.name, "ok", outcome);
  } catch (error) {
    console.warn(`Warm-up "${task.name}" failed:`, error);
    settle(task.name, "error");
  }
}

/** One frame, or a short wait when frames are not being produced (a hidden tab, a test). */
function breathe(): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      resolve();
    };
    setTimeout(go, FRAME_BREAK_MS);
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(() => go());
  });
}

function pumpLane(): Promise<void> {
  if (laneRun) return laneRun;
  laneRun = (async () => {
    while (laneQueue.length > 0) {
      await runOne(laneQueue.shift()!);
      await breathe();
    }
    laneRun = null;
  })();
  return laneRun;
}

/** Runs every registered task: the gpu lane one at a time, everything else in parallel. Idempotent. */
export function startWarmup(): Promise<void> {
  if (finishPromise) return finishPromise;
  started = true;
  const parallel: Promise<void>[] = [];
  tasks.forEach((t) => {
    if (t.lane === "gpu") laneQueue.push(t);
    else parallel.push(runOne(t));
  });
  publish();
  finishPromise = Promise.all([...parallel, pumpLane()]).then(() => {
    finished = true;
    publish();
  });
  return finishPromise;
}

/**
 * The value a finished task produced, or undefined if it timed out, failed, or
 * is still running. Sections call this on mount and fall back to their own
 * setup when it is undefined.
 */
export function warmValue<T>(name: string): T | undefined {
  return status.get(name) === "ok" ? (values.get(name) as T) : undefined;
}

/** Resolves with the value when the task settles (undefined if it did not succeed). */
export function whenWarm<T>(name: string): Promise<T | undefined> {
  const s = status.get(name);
  if (s === "ok") return Promise.resolve(values.get(name) as T);
  if (s === "timeout" || s === "error") return Promise.resolve(undefined);
  return new Promise((resolve) => {
    const list = waiters.get(name) ?? [];
    list.push(resolve as (value: unknown) => void);
    waiters.set(name, list);
  });
}

export function getWarmupSnapshot(): WarmupSnapshot {
  return snapshot;
}

/** How every registered task ended (or "pending" while it has not): the splash lights one arc per task. */
export function getWarmupStatuses(): Record<string, WarmupStatus> {
  const out: Record<string, WarmupStatus> = {};
  status.forEach((s, name) => {
    out[name] = s;
  });
  return out;
}

export function subscribeWarmup(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Test hook. */
export function resetWarmupForTests(): void {
  tasks.clear();
  status.clear();
  values.clear();
  waiters.clear();
  listeners.clear();
  laneQueue.length = 0;
  started = false;
  finished = false;
  finishPromise = null;
  laneRun = null;
  last = null;
  snapshot = { total: 0, settled: 0, started: false, finished: false, progress: 0, last: null };
}
