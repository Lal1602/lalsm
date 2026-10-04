/**
 * Warm-up pipeline: everything expensive that a section needs the first time it
 * appears (WebGL context, shader compilation, texture decode and upload) is done
 * while the preloader is on screen, so arriving at the section is just an
 * animation and never a stall.
 *
 * A task is `run(): Promise<value>`. Its value is kept so the section can adopt
 * the finished work (`warmValue`) instead of redoing it. Every task has a
 * timeout: on a slow device the preloader moves on and the section falls back
 * to doing its own setup, rather than the visitor waiting on a spinner.
 */

export interface WarmupTask {
  name: string;
  run: () => Promise<unknown>;
  /** Give up waiting after this long. Default 6000ms. */
  timeoutMs?: number;
}

export type WarmupStatus = "pending" | "ok" | "timeout" | "error";

export interface WarmupSnapshot {
  total: number;
  /** Tasks that have settled one way or another. */
  settled: number;
  started: boolean;
  finished: boolean;
  /** 0..1 */
  progress: number;
}

const DEFAULT_TIMEOUT = 6000;

const tasks = new Map<string, WarmupTask>();
const status = new Map<string, WarmupStatus>();
const values = new Map<string, unknown>();
const waiters = new Map<string, Array<(value: unknown) => void>>();
const listeners = new Set<() => void>();

let started = false;
let finished = false;
let finishPromise: Promise<void> | null = null;
let snapshot: WarmupSnapshot = { total: 0, settled: 0, started: false, finished: false, progress: 0 };

function publish() {
  const total = tasks.size;
  let settled = 0;
  status.forEach((s) => {
    if (s !== "pending") settled += 1;
  });
  snapshot = {
    total,
    settled,
    started,
    finished,
    progress: total === 0 ? (finished ? 1 : 0) : settled / total,
  };
  listeners.forEach((l) => l());
}

export function registerWarmup(task: WarmupTask): void {
  if (tasks.has(task.name)) return;
  tasks.set(task.name, task);
  status.set(task.name, "pending");
  publish();
  // Registered after the run began (a lazily loaded module): start it now.
  if (started && !finished) void runOne(task);
}

function settle(name: string, result: WarmupStatus, value?: unknown) {
  if (status.get(name) !== "pending") return;
  status.set(name, result);
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

/** Runs every registered task in parallel. Idempotent. */
export function startWarmup(): Promise<void> {
  if (finishPromise) return finishPromise;
  started = true;
  publish();
  finishPromise = Promise.all(Array.from(tasks.values()).map(runOne)).then(() => {
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
  started = false;
  finished = false;
  finishPromise = null;
  snapshot = { total: 0, settled: 0, started: false, finished: false, progress: 0 };
}
