"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { FIELD_H, FIELD_W, SHIELDS, SHIP_R, SHIP_Y, TICK, createWorld, step, type Input, type World } from "@/lib/build/game";
import { mulberry32 } from "@/lib/seededRandom";
import { useQuality } from "@/lib/quality";
import { useCalm } from "../hiw/hooks";
import { useCanvasSize, usePalette, useRunning } from "./hooks";

/**
 * PROBE: a small game, playable, to show how a game loop is built.
 *
 * The simulation (lib/build/game) is pure and advances in fixed 1/60 s ticks from an
 * accumulator, so the game plays identically on a 60Hz phone and a 240Hz monitor and a
 * slow frame cannot make anything tunnel through the probe. Drawing happens once per
 * display frame and interpolates between the last two ticks, which is why the panel
 * can show two honest numbers that differ: simulation ticks per second, and frames
 * drawn per second.
 *
 * Nothing starts until you press Launch, nothing is captured outside the field (the
 * keys only steer while it has focus; vertical swipes still scroll the page), and the
 * loop stops when the panel is off screen. The canvas is one 2D context with no
 * allocation per frame: debris shapes are tabled, particles are a fixed pool.
 */

const COLORS = ["--wb-tone", "--wb-ink", "--wb-dim", "--wb-bad", "--wb-warn", "--wb-grid"];
const BEST_KEY = "lalsm:probe-best";

/** Eight debris silhouettes: radius factors round a ring, fixed once. */
const SHAPES: number[][] = (() => {
  const r = mulberry32(11);
  return Array.from({ length: 8 }, () => Array.from({ length: 9 }, () => 0.72 + r() * 0.42));
})();

/** Three star layers, each a list of [x, y] in field units. */
const STARS: Array<Array<[number, number]>> = (() => {
  const r = mulberry32(5);
  return [26, 18, 10].map((n) => Array.from({ length: n }, () => [r() * FIELD_W, r() * FIELD_H] as [number, number]));
})();
const STAR_SPEED = [10, 22, 44];

interface Spark {
  on: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

type Phase = "ready" | "play" | "over";

export default function ProbeRun() {
  const rootRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const running = useRunning(rootRef);
  const { calm } = useCalm();
  const { preset } = useQuality();
  const palette = usePalette(fieldRef, COLORS);
  const size = useCanvasSize(canvasRef, calm ? 1 : Math.min(preset.dpr, 2));

  const [phase, setPhase] = useState<Phase>("ready");
  // This component never renders on the server (it is loaded client-only), so storage can be read up front.
  const [best, setBest] = useState(() => {
    try {
      const v = Number(localStorage.getItem(BEST_KEY));
      return Number.isFinite(v) && v > 0 ? v : 0;
    } catch {
      return 0; // storage unavailable: no personal best, nothing else changes
    }
  });
  const [result, setResult] = useState({ score: 0, shards: 0 });

  const world = useRef<World | null>(null);
  const input = useRef<Input>({ targetX: null, dir: 0 });
  const keys = useRef({ left: false, right: false });
  const phaseRef = useRef<Phase>("ready");
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const scoreRef = useRef<HTMLElement>(null);
  const shardRef = useRef<HTMLElement>(null);
  const timeRef = useRef<HTMLElement>(null);
  const simRef = useRef<HTMLElement>(null);
  const drawRef = useRef<HTMLElement>(null);
  const pipsRef = useRef<HTMLSpanElement>(null);

  const paintPips = useCallback((shield: number) => {
    pipsRef.current?.querySelectorAll("i").forEach((el, i) => el.toggleAttribute("data-on", i < shield));
  }, []);

  const start = useCallback(() => {
    world.current = createWorld((Math.random() * 1e9) | 0);
    input.current = { targetX: null, dir: 0 };
    keys.current = { left: false, right: false };
    paintPips(SHIELDS);
    setPhase("play");
    fieldRef.current?.focus({ preventScroll: true });
  }, [paintPips]);

  const finish = useCallback((w: World) => {
    setResult({ score: w.score, shards: w.shards });
    setBest((b) => {
      const next = Math.max(b, w.score);
      if (next !== b) {
        try {
          localStorage.setItem(BEST_KEY, String(next));
        } catch {
          /* ignore */
        }
      }
      return next;
    });
    setPhase("over");
  }, []);

  // The effect draws one still frame when nothing is moving (ready / over), so the field is never blank.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;
    const sparks: Spark[] = Array.from({ length: 24 }, () => ({ on: false, x: 0, y: 0, vx: 0, vy: 0, life: 0 }));
    let shake = 0;

    const draw = (alpha: number, now: number, dt: number) => {
      const w = world.current;
      const { w: cw, h: ch, dpr } = size.current;
      const sx = (cw / FIELD_W) * dpr;
      const sy = (ch / FIELD_H) * dpr;
      ctx.setTransform(sx, 0, 0, sy, 0, 0);
      ctx.clearRect(0, 0, FIELD_W, FIELD_H);

      if (shake > 0 && !calm) {
        shake = Math.max(0, shake - dt);
        ctx.translate(Math.sin(now * 0.09) * shake * 26, Math.cos(now * 0.11) * shake * 18);
      }

      // Stars drift with the clock the game keeps; calm freezes them.
      const t = w && !calm ? w.t : 0;
      ctx.fillStyle = palette.current["--wb-dim"] || "#789";
      for (let l = 0; l < STARS.length; l++) {
        const layer = STARS[l]!;
        const off = (t * STAR_SPEED[l]!) % FIELD_H;
        const s = l === 2 ? 1.6 : 1.1;
        for (let i = 0; i < layer.length; i++) {
          const star = layer[i]!;
          ctx.fillRect(star[0], (star[1] + off) % FIELD_H, s, s);
        }
      }

      // Floor line the probe flies over.
      ctx.strokeStyle = palette.current["--wb-grid"] || "rgba(255,255,255,.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, SHIP_Y + SHIP_R + 12.5);
      ctx.lineTo(FIELD_W, SHIP_Y + SHIP_R + 12.5);
      ctx.stroke();

      if (w) {
        // Debris and shards, interpolated between the last two ticks.
        ctx.lineWidth = 1.4;
        for (let i = 0; i < w.objs.length; i++) {
          const o = w.objs[i]!;
          if (!o.active) continue;
          const y = o.py + (o.y - o.py) * alpha;
          if (o.kind === 1) {
            ctx.fillStyle = palette.current["--wb-warn"] || "#fc6";
            ctx.beginPath();
            ctx.moveTo(o.x, y - o.r - 2);
            ctx.lineTo(o.x + o.r * 0.8, y);
            ctx.lineTo(o.x, y + o.r + 2);
            ctx.lineTo(o.x - o.r * 0.8, y);
            ctx.closePath();
            ctx.fill();
          } else {
            const shape = SHAPES[o.seed % SHAPES.length]!;
            ctx.strokeStyle = palette.current["--wb-ink"] || "#ddd";
            ctx.fillStyle = "rgba(120,130,160,.16)";
            ctx.beginPath();
            for (let k = 0; k < shape.length; k++) {
              const a = o.angle + (k / shape.length) * Math.PI * 2;
              const rr = o.r * shape[k]!;
              const px = o.x + Math.cos(a) * rr;
              const py = y + Math.sin(a) * rr;
              if (k === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }
        }

        // The probe: a dart with a thruster, blinking while it is protected.
        const x = w.prevShipX + (w.shipX - w.prevShipX) * alpha;
        const blinkOff = w.invuln > 0 && Math.floor(now / 90) % 2 === 0;
        if (!blinkOff && !(w.over && phaseRef.current !== "play")) {
          const flame = 6 + (calm ? 2 : Math.sin(now * 0.05) * 2 + 2);
          ctx.fillStyle = palette.current["--wb-warn"] || "#fc6";
          ctx.beginPath();
          ctx.moveTo(x - 3.5, SHIP_Y + 8);
          ctx.lineTo(x, SHIP_Y + 8 + flame);
          ctx.lineTo(x + 3.5, SHIP_Y + 8);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = palette.current["--wb-tone"] || "#6cf";
          ctx.beginPath();
          ctx.moveTo(x, SHIP_Y - 14);
          ctx.lineTo(x + 10, SHIP_Y + 10);
          ctx.lineTo(x, SHIP_Y + 5);
          ctx.lineTo(x - 10, SHIP_Y + 10);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Sparks from collecting a shard (a fixed pool, skipped when calm).
      for (let i = 0; i < sparks.length; i++) {
        const s = sparks[i]!;
        if (!s.on) continue;
        s.life -= dt;
        if (s.life <= 0) {
          s.on = false;
          continue;
        }
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        ctx.globalAlpha = Math.min(1, s.life * 3);
        ctx.fillStyle = palette.current["--wb-warn"] || "#fc6";
        ctx.fillRect(s.x, s.y, 2, 2);
      }
      ctx.globalAlpha = 1;
    };
    const burst = (x: number, y: number) => {
      if (calm) return;
      let n = 0;
      for (let i = 0; i < sparks.length && n < 9; i++) {
        const s = sparks[i]!;
        if (s.on) continue;
        const a = (n / 9) * Math.PI * 2;
        Object.assign(s, { on: true, x, y, vx: Math.cos(a) * 70, vy: Math.sin(a) * 70, life: 0.45 });
        n++;
      }
    };

    // The loop: only while playing, on screen and in a visible tab.
    let raf = 0;
    if (running && phase === "play") {
      let last = performance.now();
      let acc = 0;
      let ticks = 0;
      let frames = 0;
      let mark = last;

      const frame = (now: number) => {
        const w = world.current;
        if (!w) return;
        const dt = Math.min(0.1, (now - last) / 1000);
        last = now;
        acc += dt;

        input.current.dir = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0);
        while (acc >= TICK && !w.over) {
          step(w, TICK, input.current);
          acc -= TICK;
          ticks++;
        }
        frames++;

        let ended = false;
        for (const e of w.events) {
          if (e.type === "shard") burst(e.x, e.y);
          else if (e.type === "hit") {
            shake = 0.22;
            paintPips(w.shield);
          } else if (e.type === "over") ended = true;
        }
        w.events.length = 0;

        draw(w.over ? 1 : acc / TICK, now, dt);

        if (now - mark >= 500) {
          const secs = (now - mark) / 1000;
          if (scoreRef.current) scoreRef.current.textContent = String(w.score);
          if (shardRef.current) shardRef.current.textContent = String(w.shards);
          if (timeRef.current) timeRef.current.textContent = w.t.toFixed(0);
          if (simRef.current) simRef.current.textContent = String(Math.round(ticks / secs));
          if (drawRef.current) drawRef.current.textContent = String(Math.round(frames / secs));
          ticks = 0;
          frames = 0;
          mark = now;
        }

        if (ended) {
          if (scoreRef.current) scoreRef.current.textContent = String(w.score);
          finish(w);
          return;
        }
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    } else {
      draw(1, performance.now(), 0);
    }

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [running, phase, calm, palette, size, finish, paintPips]);

  // ── input ────────────────────────────────────────────────────────────────
  const toField = (clientX: number) => {
    const r = fieldRef.current?.getBoundingClientRect();
    return r && r.width ? ((clientX - r.left) / r.width) * FIELD_W : null;
  };

  const onPointer = (e: React.PointerEvent) => {
    if (phaseRef.current !== "play") return;
    input.current.targetX = toField(e.clientX);
  };

  const onPointerEnd = () => {
    input.current.targetX = null;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (phaseRef.current !== "play") return;
    const k = e.key;
    if (k === "ArrowLeft" || k === "a" || k === "A") keys.current.left = true;
    else if (k === "ArrowRight" || k === "d" || k === "D") keys.current.right = true;
    else return;
    input.current.targetX = null; // the keyboard takes over from a parked pointer
    e.preventDefault();
  };

  const onKeyUp = (e: React.KeyboardEvent) => {
    const k = e.key;
    if (k === "ArrowLeft" || k === "a" || k === "A") keys.current.left = false;
    else if (k === "ArrowRight" || k === "d" || k === "D") keys.current.right = false;
  };

  return (
    <div className="wb-demo wb-game" ref={rootRef} data-phase={phase}>
      <div
        className="wb-field"
        ref={fieldRef}
        tabIndex={0}
        role="group"
        aria-label="Probe Run game field. Press Launch, then steer with the left and right arrow keys, or drag."
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse") e.currentTarget.setPointerCapture(e.pointerId);
          onPointer(e);
        }}
        onPointerMove={onPointer}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onPointerLeave={onPointerEnd}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onBlur={() => {
          keys.current.left = keys.current.right = false;
        }}
      >
        <canvas ref={canvasRef} className="wb-field-canvas" aria-hidden="true" />

        {phase !== "play" ? (
          <div className="wb-field-veil" role={phase === "over" ? "status" : undefined}>
            {phase === "over" ? (
              <>
                <p className="wb-veil-kicker">Probe lost</p>
                <p className="wb-veil-score">{result.score}</p>
                <p className="wb-veil-sub">
                  {result.shards} shards{best ? ` · best ${best}` : ""}
                </p>
              </>
            ) : (
              <>
                <p className="wb-veil-kicker">Probe Run</p>
                <p className="wb-veil-sub">Catch the shards. Dodge the rock.{best ? ` Best ${best}.` : ""}</p>
              </>
            )}
            <button type="button" className="wb-go wb-go--solid" onClick={start}>
              {phase === "over" ? "Run again" : "Launch"}
            </button>
          </div>
        ) : null}
      </div>

      <div className="wb-game-side">
        <dl className="wb-game-stats">
          <div>
            <dt>Score</dt>
            <dd>
              <b ref={scoreRef}>0</b>
            </dd>
          </div>
          <div>
            <dt>Shards</dt>
            <dd>
              <b ref={shardRef}>0</b>
            </dd>
          </div>
          <div>
            <dt>Seconds</dt>
            <dd>
              <b ref={timeRef}>0</b>
            </dd>
          </div>
          <div>
            <dt>Shield</dt>
            <dd>
              <span className="wb-pips" ref={pipsRef} aria-label={`${SHIELDS} shields`}>
                {Array.from({ length: SHIELDS }, (_, i) => (
                  <i key={i} data-on="" />
                ))}
              </span>
            </dd>
          </div>
        </dl>

        <div className="wb-loop">
          <p className="wb-loop-row">
            <span>simulation</span>
            <b>
              <em ref={simRef}>60</em> ticks/s
            </b>
          </p>
          <p className="wb-loop-row">
            <span>drawing</span>
            <b>
              <em ref={drawRef}>--</em> frames/s
            </b>
          </p>
        </div>

        <p className="wb-demo-note">
          Two clocks. The game steps at a fixed 60 ticks a second whatever your screen does; drawing interpolates between
          ticks. Steer with the pointer, a finger, or the arrow keys while the field has focus.
        </p>
      </div>
    </div>
  );
}
