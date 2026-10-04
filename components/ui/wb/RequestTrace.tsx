"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import * as m from "motion/react-m";
import { animate, useMotionValue, useMotionValueEvent, useTransform, type AnimationPlaybackControls } from "motion/react";
import { LANES, planTrace, route, spanBox, type Lane, type Trace } from "@/lib/build/trace";
import { useCalm } from "../hiw/hooks";
import { useRunning } from "./hooks";

/**
 * REACTOR: one request, followed through the stack.
 *
 * A packet travels browser → edge → API → cache → database and back while the waterfall
 * beside it fills in, span by span, in the same order. Two switches change what happens:
 * a cold cache sends the request all the way to the database, and a database that times
 * out makes it fail once, back off and retry with the same idempotency key, and still
 * answer 200. A warm cache ignores the fault completely, which is the point of a cache.
 *
 * It is a model, not a measurement, and says so on the panel. The plan is pure data
 * (lib/build/trace); this file only plays it back, slowed down so it can be followed.
 * With reduced motion or Lite the answer simply appears.
 */

const NODES: Array<{ lane: Lane; name: string; role: string }> = [
  { lane: "client", name: "Browser", role: "your tab" },
  { lane: "edge", name: "Edge", role: "TLS, routing" },
  { lane: "api", name: "API", role: "auth, logic" },
  { lane: "cache", name: "Cache", role: "hot reads" },
  { lane: "db", name: "Database", role: "source of truth" },
];

const PLAYBACK_S = 2.8;

export default function RequestTrace() {
  const rootRef = useRef<HTMLDivElement>(null);
  const running = useRunning(rootRef);
  const { calm } = useCalm();

  const [cache, setCache] = useState<"hit" | "miss">("hit");
  const [fault, setFault] = useState(false);
  const [trace, setTrace] = useState<Trace | null>(null);
  const [run, setRun] = useState(0);
  const [busy, setBusy] = useState(false);
  const [at, setAt] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  const opts = useRef({ cache, fault });
  const seed = useRef(0);
  const controls = useRef<AnimationPlaybackControls[]>([]);
  const started = useRef(false);

  // The packet's position on the five-node rail (0..4), and the running total.
  const px = useMotionValue(0);
  const total = useMotionValue(0);
  const left = useTransform(px, (v) => `${((v + 0.5) / LANES.length) * 100}%`);
  const shownTotal = useTransform(total, (v) => Math.round(v));

  useMotionValueEvent(px, "change", (v) => {
    const n = Math.round(v);
    setAt((prev) => (prev === n ? prev : n));
  });

  const stopAll = () => {
    controls.current.forEach((c) => c.stop());
    controls.current = [];
  };
  useEffect(() => stopAll, []);

  const send = useCallback(() => {
    stopAll();
    const plan = planTrace({ ...opts.current, seed: ++seed.current });
    setTrace(plan);
    setRun((n) => n + 1);

    const finish = () => {
      setBusy(false);
      setAt(0);
      setLog((l) => [plan.line, ...l].slice(0, 3));
    };

    if (calm) {
      px.set(0);
      total.set(plan.total);
      finish();
      return;
    }

    setBusy(true);
    px.set(0);
    total.set(0);

    // The packet is at each lane at the middle of that lane's span, and home at both ends.
    const stops = route(plan).map((l) => LANES.indexOf(l));
    const times = [0, ...plan.spans.map((s) => (s.start + s.dur / 2) / plan.total), 1];
    controls.current = [
      animate(px, stops, { duration: PLAYBACK_S, times, ease: "easeInOut", onComplete: finish }),
      animate(total, plan.total, { duration: PLAYBACK_S, ease: "linear" }),
    ];
  }, [calm, px, total]);

  // Show something the first time the panel is seen.
  useEffect(() => {
    if (running && !started.current) {
      started.current = true;
      send();
    }
  }, [running, send]);

  const pick = (next: Partial<{ cache: "hit" | "miss"; fault: boolean }>) => {
    opts.current = { ...opts.current, ...next };
    if (next.cache) setCache(next.cache);
    if (next.fault !== undefined) setFault(next.fault);
    send();
  };

  const failedLanes = new Set(trace?.spans.filter((s) => !s.ok).map((s) => s.lane));
  const retried = Boolean(trace && trace.dbAttempts > 1);

  return (
    <div className="wb-demo wb-trace" ref={rootRef} data-busy={busy || undefined}>
      <div className="wb-rail" aria-hidden="true">
        <div className="wb-rail-nodes">
          {NODES.map((n, i) => (
            <div
              key={n.lane}
              className="wb-node"
              data-on={busy && at === i ? "" : undefined}
              data-bad={failedLanes.has(n.lane) ? "" : undefined}
              data-skipped={trace && !trace.spans.some((s) => s.lane === n.lane) && n.lane !== "client" ? "" : undefined}
            >
              <i className="wb-node-dot" />
              <b>{n.name}</b>
              <span>{n.role}</span>
            </div>
          ))}
        </div>
        <span className="wb-rail-line" />
        <m.i className="wb-packet" inherit={false} style={{ left, opacity: busy ? 1 : 0 }} />
      </div>

      <div className="wb-trace-head">
        <p className="wb-trace-req">
          <b>GET</b> /api/orders/42
        </p>
        <p className="wb-trace-result" data-ok={!busy && trace ? "" : undefined}>
          <span className="wb-trace-status">{busy ? "in flight" : trace ? `${trace.status} OK` : "idle"}</span>
          <span className="wb-trace-total">
            <m.b inherit={false}>{shownTotal}</m.b> ms
          </span>
        </p>
      </div>

      <ol className="wb-spans" aria-label="Request waterfall">
        {trace
          ? trace.spans.map((s) => {
              const box = spanBox(s, trace.total);
              const delay = calm ? 0 : (s.start / trace.total) * PLAYBACK_S;
              const dur = calm ? 0 : Math.max(0.14, (s.dur / trace.total) * PLAYBACK_S);
              return (
                <li key={`${run}-${s.id}`} className="wb-span" data-lane={s.lane} data-ok={s.ok} data-idle={s.idle || undefined}>
                  <span className="wb-span-label">{s.label}</span>
                  <span className="wb-span-track">
                    <m.i
                      className="wb-span-bar"
                      inherit={false}
                      style={{ left: `${box.left * 100}%`, width: `${box.width * 100}%`, originX: 0 }}
                      initial={{ scaleX: calm ? 1 : 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay, duration: dur, ease: "easeOut" }}
                    />
                  </span>
                  <span className="wb-span-ms">{s.dur < 10 ? s.dur.toFixed(1) : Math.round(s.dur)}</span>
                </li>
              );
            })
          : null}
      </ol>

      {retried && trace && !busy ? (
        <p className="wb-trace-note" data-tone="bad">
          The first database call timed out. The API waited, retried with the same key{" "}
          <code>{trace.key}</code>, so a repeated write could not be applied twice, and the visitor still got a 200.
        </p>
      ) : trace && !busy && trace.cache === "hit" ? (
        <p className="wb-trace-note">
          Served from the cache in {Math.round(trace.total)} ms. The database was never asked
          {trace.fault ? ", so its outage did not touch this request" : ""}.
        </p>
      ) : trace && !busy ? (
        <p className="wb-trace-note">Cache miss: one trip to the database, then the answer is stored for the next visitor.</p>
      ) : (
        <p className="wb-trace-note">&nbsp;</p>
      )}

      <div className="wb-trace-ctl">
        <div className="wb-ctl">
          <p className="wb-ctl-label" id="wb-cache-label">
            Cache
          </p>
          <div className="wb-seg" role="group" aria-labelledby="wb-cache-label">
            <button type="button" className="wb-seg-btn" aria-pressed={cache === "hit"} onClick={() => pick({ cache: "hit" })}>
              <b>Warm</b>
              <i>already stored</i>
            </button>
            <button type="button" className="wb-seg-btn" aria-pressed={cache === "miss"} onClick={() => pick({ cache: "miss" })}>
              <b>Cold</b>
              <i>first visitor</i>
            </button>
          </div>
        </div>
        <div className="wb-ctl">
          <p className="wb-ctl-label" id="wb-db-label">
            Database
          </p>
          <div className="wb-seg" role="group" aria-labelledby="wb-db-label">
            <button type="button" className="wb-seg-btn" aria-pressed={!fault} onClick={() => pick({ fault: false })}>
              <b>Healthy</b>
              <i>~40 ms</i>
            </button>
            <button type="button" className="wb-seg-btn" aria-pressed={fault} onClick={() => pick({ fault: true })}>
              <b>Times out</b>
              <i>250 ms, once</i>
            </button>
          </div>
        </div>
        <button type="button" className="wb-go" onClick={send} disabled={busy}>
          {busy ? "In flight" : "Send again"}
        </button>
      </div>

      <ol className="wb-log" aria-live="polite" aria-label="Request log">
        {log.map((l, i) => (
          <li key={`${l}-${i}`} data-latest={i === 0 || undefined}>
            {l}
          </li>
        ))}
      </ol>

    </div>
  );
}
