"use client";
import { useEffect, useRef, useState } from "react";
import { BUDGET_MS, FrameRing, grade, type Grade } from "@/lib/build/frameStats";
import { holdQualityGovernor, useQuality } from "@/lib/quality";
import { useCanvasSize, usePalette, useRunning } from "./hooks";

/**
 * HELM: a frame-time meter that measures the page it is on.
 *
 * Every bar is a real requestAnimationFrame interval from this tab, graded against the
 * 60fps budget (16.7ms). The load switch is the experiment: it spends a fixed slice of
 * each frame on the main thread, so you can watch the bars climb across the budget line
 * and drop back when it lets go (it always lets go by itself after five seconds).
 *
 * While the load is on the quality governor is paused (lib/quality), otherwise the
 * staged stutter would be read as a struggling device and strip the page's effects.
 *
 * Cost when you are not looking: nothing. The loop runs only while the panel is on
 * screen and the tab is visible.
 */

const BARS = 96;
const SCALE_MS = 50; // the top of the chart
const BURN_MS = [0, 8, 30] as const;
const LOADS = [
  { label: "Idle", hint: "nothing added" },
  { label: "+8 ms", hint: "light work" },
  { label: "+30 ms", hint: "heavy work" },
] as const;
const RELEASE_AFTER = 5000;

const COLORS = ["--wb-ok", "--wb-warn", "--wb-bad", "--wb-grid", "--wb-line"];

export default function FrameMeter() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const running = useRunning(rootRef);
  const palette = usePalette(rootRef, COLORS);
  const { tier, preset } = useQuality();
  const size = useCanvasSize(canvasRef, Math.min(preset.dpr, 2));

  const [ring] = useState(() => new FrameRing(BARS));

  const [load, setLoad] = useState(0);
  const loadRef = useRef(0);
  const releaseAt = useRef(0);
  const [verdict, setVerdict] = useState("");

  const fpsRef = useRef<HTMLElement>(null);
  const avgRef = useRef<HTMLElement>(null);
  const p95Ref = useRef<HTMLElement>(null);
  const worstRef = useRef<HTMLElement>(null);
  const dropRef = useRef<HTMLElement>(null);
  const gradeRef = useRef<HTMLDivElement>(null);

  const choose = (n: number) => {
    loadRef.current = n;
    releaseAt.current = 0; // armed by the loop on the first loaded frame
    ring.clear();
    setLoad(n);
  };

  // Hold the governor while a load is on, whatever ends it.
  useEffect(() => {
    if (!load || !running) return;
    holdQualityGovernor(true);
    return () => holdQualityGovernor(false);
  }, [load, running]);

  // A short, polite summary for assistive technology, once the numbers have settled.
  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => {
      const s = ring.summary();
      if (s.count < 10) return;
      setVerdict(
        `${LOADS[load]!.label === "Idle" ? "Idle" : `With ${LOADS[load]!.label} per frame`}: average ${s.avg.toFixed(1)} milliseconds, ${s.dropped} dropped frames in the last ${s.count}.`,
      );
    }, 1600);
    return () => window.clearTimeout(id);
  }, [load, running, ring]);

  useEffect(() => {
    if (!running) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;
    ring.clear();

    let raf = 0;
    let last = performance.now();
    let lastRead = 0;

    const colorOf = (g: Grade) => palette.current[g === "ok" ? "--wb-ok" : g === "warn" ? "--wb-warn" : "--wb-bad"] || "#6cf";

    const draw = () => {
      const { w, h, dpr } = size.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Gridlines every 10ms, the budget line dashed on top.
      ctx.lineWidth = 1;
      ctx.strokeStyle = palette.current["--wb-grid"] || "rgba(255,255,255,.07)";
      ctx.beginPath();
      for (let ms = 10; ms < SCALE_MS; ms += 10) {
        const y = Math.round(h - (ms / SCALE_MS) * h) + 0.5;
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      const bw = w / BARS;
      const n = ring.count;
      let current: string | null = null;
      for (let i = 0; i < n; i++) {
        const ms = ring.at(i);
        const g = grade(ms);
        const fill = colorOf(g);
        if (fill !== current) {
          ctx.fillStyle = fill;
          current = fill;
        }
        const bh = Math.max(2, Math.min(1, ms / SCALE_MS) * h);
        ctx.fillRect((BARS - n + i) * bw + 0.5, h - bh, Math.max(1, bw - 1.5), bh);
      }

      const by = Math.round(h - (BUDGET_MS / SCALE_MS) * h) + 0.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = palette.current["--wb-line"] || "rgba(255,255,255,.5)";
      ctx.beginPath();
      ctx.moveTo(0, by);
      ctx.lineTo(w, by);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const read = () => {
      const s = ring.summary();
      if (!s.count) return;
      if (fpsRef.current) fpsRef.current.textContent = String(Math.round(s.fps));
      if (avgRef.current) avgRef.current.textContent = s.avg.toFixed(1);
      if (p95Ref.current) p95Ref.current.textContent = s.p95.toFixed(1);
      if (worstRef.current) worstRef.current.textContent = s.worst.toFixed(0);
      if (dropRef.current) dropRef.current.textContent = String(s.dropped);
      gradeRef.current?.setAttribute("data-grade", grade(s.p95));
    };

    const frame = (now: number) => {
      ring.push(now - last);
      last = now;

      const burn = BURN_MS[loadRef.current as 0 | 1 | 2] ?? 0;
      if (burn) {
        const t0 = performance.now();
        while (performance.now() - t0 < burn) {
          /* spend the budget, on purpose */
        }
        if (!releaseAt.current) releaseAt.current = now + RELEASE_AFTER;
        else if (now > releaseAt.current) {
          loadRef.current = 0;
          ring.clear();
          setLoad(0);
        }
      }

      draw();
      if (now - lastRead > 250) {
        lastRead = now;
        read();
      }
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [running, palette, size, ring]);

  return (
    <div className="wb-demo wb-meter" ref={rootRef} data-load={load}>
      <div className="wb-meter-read" ref={gradeRef} data-grade="ok">
        <p className="wb-stat wb-stat--big">
          <b ref={fpsRef}>--</b>
          <span>frames / s</span>
        </p>
        <p className="wb-stat">
          <b ref={avgRef}>--</b>
          <span>avg ms</span>
        </p>
        <p className="wb-stat">
          <b ref={p95Ref}>--</b>
          <span>p95 ms</span>
        </p>
        <p className="wb-stat">
          <b ref={worstRef}>--</b>
          <span>worst ms</span>
        </p>
        <p className="wb-stat wb-stat--drop">
          <b ref={dropRef}>--</b>
          <span>dropped</span>
        </p>
      </div>

      <div className="wb-meter-chart">
        <canvas ref={canvasRef} className="wb-meter-canvas" aria-hidden="true" />
        <span className="wb-meter-budget" aria-hidden="true">
          16.7 ms · 60 fps budget
        </span>
      </div>

      <ul className="wb-legend" aria-hidden="true">
        <li data-g="ok">within budget</li>
        <li data-g="warn">stutter</li>
        <li data-g="bad">dropped frame</li>
      </ul>

      <div className="wb-meter-ctl">
        <p className="wb-ctl-label" id="wb-load-label">
          Add main-thread work to every frame
        </p>
        <div className="wb-seg" role="group" aria-labelledby="wb-load-label">
          {LOADS.map((l, i) => (
            <button key={l.label} type="button" className="wb-seg-btn" aria-pressed={load === i} onClick={() => choose(i)}>
              <b>{l.label}</b>
              <i>{l.hint}</i>
            </button>
          ))}
        </div>
      </div>

      <p className="wb-demo-note">
        Real intervals from this tab, not a recording. Anything above the dashed line missed its frame. A load lets go by
        itself after five seconds, and the page&apos;s adaptive quality (now tier {tier}) is paused while it runs.
      </p>
      <p className="wb-sr" role="status">
        {verdict}
      </p>
    </div>
  );
}
