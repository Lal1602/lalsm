import { mulberry32 } from "../seededRandom";

/**
 * The REACTOR demo's request, planned as pure data.
 *
 * Nothing is sent anywhere: this is a model of one GET going through a typical stack
 * (edge, API, cache, database), with the two things that make backends interesting
 * exposed as switches: a cold cache, and a database that times out. The numbers are
 * plausible and seeded (so a run is reproducible and testable), and the page says
 * plainly that it is a simulation.
 *
 * The structure is the lesson: a cache hit never touches the database, so a database
 * fault does not matter to it; a miss with a fault times out once, backs off, retries
 * with the same idempotency key and still answers 200.
 */

export type Lane = "client" | "edge" | "api" | "cache" | "db";

/** Left to right, as drawn. */
export const LANES: Lane[] = ["client", "edge", "api", "cache", "db"];

export interface Span {
  id: string;
  lane: Lane;
  label: string;
  /** Virtual milliseconds from the request leaving the browser. */
  start: number;
  dur: number;
  ok: boolean;
  /** A wait, not work: drawn hatched. */
  idle?: boolean;
}

export interface Trace {
  spans: Span[];
  /** Wall time of the whole request, in virtual ms. */
  total: number;
  status: number;
  /** Database attempts made (0 when the cache answered). */
  dbAttempts: number;
  /** Echoed on every retry so a repeated write could not be applied twice. */
  key: string;
  cache: "hit" | "miss";
  fault: boolean;
  /** One line for the log. */
  line: string;
}

export interface TraceOptions {
  cache: "hit" | "miss";
  fault: boolean;
  seed: number;
}

export const TIMEOUT_MS = 250;

const round = (n: number) => Math.round(n * 10) / 10;

export function planTrace({ cache, fault, seed }: TraceOptions): Trace {
  const rand = mulberry32(seed * 2654435761 + 97);
  const between = (lo: number, hi: number) => round(lo + rand() * (hi - lo));

  const spans: Span[] = [];
  let t = 0;
  const add = (lane: Lane, id: string, label: string, dur: number, ok = true, idle = false) => {
    spans.push({ id, lane, label, start: round(t), dur, ok, idle: idle || undefined });
    t = round(t + dur);
  };

  add("edge", "edge", "edge · TLS, route", between(7, 13));
  add("api", "auth", "api · auth, validate", between(4, 8));
  add("cache", "cache-get", cache === "hit" ? "cache · get (hit)" : "cache · get (miss)", between(1.5, 3.5));

  let dbAttempts = 0;
  if (cache === "miss") {
    if (fault) {
      dbAttempts++;
      add("db", "db-1", `db · query, timed out at ${TIMEOUT_MS}ms`, TIMEOUT_MS, false);
      add("api", "backoff", "api · back off, then retry", between(90, 140), true, true);
    }
    dbAttempts++;
    add("db", `db-${dbAttempts}`, fault ? "db · query (retry)" : "db · query", between(28, 46));
    add("cache", "cache-set", "cache · set", between(1.5, 3));
  }

  add("api", "serialize", "api · serialise", between(3, 6));
  add("edge", "respond", "edge · respond", between(2, 4));

  const total = round(t);
  const key = "req_" + Math.floor(rand() * 0xffffff).toString(36).padStart(5, "0");
  const note = cache === "hit" ? "cache hit" : fault ? `cache miss, ${dbAttempts} db attempts` : "cache miss";
  return {
    spans,
    total,
    status: 200,
    dbAttempts,
    key,
    cache,
    fault,
    line: `${key}  GET /api/orders/42  200  ${Math.round(total)}ms  ${note}`,
  };
}

/** The lanes the request visits, in order, collapsing repeats; it ends back at the client. */
export function route(trace: Trace): Lane[] {
  const out: Lane[] = ["client"];
  for (const s of trace.spans) if (out[out.length - 1] !== s.lane) out.push(s.lane);
  // Back through the stack to whoever asked: edge, then the client.
  if (out[out.length - 1] !== "edge") out.push("edge");
  out.push("client");
  return out;
}

/** Position of each span on a 0..1 track, for drawing the waterfall. */
export function spanBox(span: Span, total: number): { left: number; width: number } {
  const safe = total > 0 ? total : 1;
  return { left: span.start / safe, width: Math.max(span.dur / safe, 0.012) };
}
