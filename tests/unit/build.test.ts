import { describe, expect, it } from "vitest";
import { BUDGET_MS, FrameRing, grade } from "@/lib/build/frameStats";
import { LANES, TIMEOUT_MS, planTrace, route, spanBox } from "@/lib/build/trace";
import { FIELD_H, FIELD_W, SHIELDS, SHIP_Y, TICK, createWorld, difficulty, spawnGap, step, type Input } from "@/lib/build/game";

describe("frame ring", () => {
  it("grades against the 60fps budget", () => {
    expect(grade(6.9)).toBe("ok");
    expect(grade(BUDGET_MS)).toBe("ok");
    expect(grade(24)).toBe("warn");
    expect(grade(40)).toBe("bad");
    expect(grade(40, 1000 / 30)).toBe("ok"); // a 30fps budget forgives 40ms
    expect(grade(60, 1000 / 30)).toBe("warn");
  });

  it("keeps only the last N frames, oldest first", () => {
    const r = new FrameRing(4);
    for (let i = 1; i <= 6; i++) r.push(i);
    expect(r.count).toBe(4);
    expect([0, 1, 2, 3].map((i) => r.at(i))).toEqual([3, 4, 5, 6]);
  });

  it("summarises average, p95, worst and dropped frames", () => {
    const r = new FrameRing(100);
    for (let i = 0; i < 95; i++) r.push(10);
    for (let i = 0; i < 5; i++) r.push(50);
    const s = r.summary();
    expect(s.count).toBe(100);
    expect(s.worst).toBe(50);
    expect(s.dropped).toBe(5);
    expect(s.avg).toBeCloseTo(12, 5);
    expect(s.p95).toBe(10);
    expect(s.fps).toBeCloseTo(1000 / 12, 5);
  });

  it("ignores things that are not frames", () => {
    const r = new FrameRing(8);
    r.push(NaN);
    r.push(-3);
    r.push(0);
    r.push(5000); // a tab coming back from the background
    expect(r.count).toBe(0);
    expect(r.summary()).toEqual({ count: 0, avg: 0, p95: 0, worst: 0, dropped: 0, fps: 0 });
    r.push(16);
    r.clear();
    expect(r.count).toBe(0);
  });
});

describe("request trace", () => {
  const base = { seed: 7 };

  it("is reproducible for a seed and varies between seeds", () => {
    expect(planTrace({ ...base, cache: "miss", fault: false })).toEqual(planTrace({ ...base, cache: "miss", fault: false }));
    expect(planTrace({ cache: "miss", fault: false, seed: 1 }).total).not.toBe(planTrace({ cache: "miss", fault: false, seed: 2 }).total);
  });

  it("a cache hit never touches the database, with or without a fault", () => {
    for (const fault of [false, true]) {
      const t = planTrace({ ...base, cache: "hit", fault });
      expect(t.dbAttempts).toBe(0);
      expect(t.spans.some((s) => s.lane === "db")).toBe(false);
      expect(t.status).toBe(200);
      expect(t.total).toBeLessThan(40);
    }
  });

  it("a miss reads the database once and fills the cache", () => {
    const t = planTrace({ ...base, cache: "miss", fault: false });
    expect(t.dbAttempts).toBe(1);
    expect(t.spans.filter((s) => s.lane === "db")).toHaveLength(1);
    expect(t.spans.some((s) => s.id === "cache-set")).toBe(true);
    expect(t.spans.every((s) => s.ok)).toBe(true);
  });

  it("a timed-out database costs one failed attempt, a backoff and a retry, and still answers 200", () => {
    const t = planTrace({ ...base, cache: "miss", fault: true });
    expect(t.dbAttempts).toBe(2);
    const dbs = t.spans.filter((s) => s.lane === "db");
    expect(dbs).toHaveLength(2);
    expect(dbs[0]!.ok).toBe(false);
    expect(dbs[0]!.dur).toBe(TIMEOUT_MS);
    expect(dbs[1]!.ok).toBe(true);
    expect(t.spans.some((s) => s.idle)).toBe(true);
    expect(t.status).toBe(200);
    expect(t.total).toBeGreaterThan(TIMEOUT_MS);
  });

  it("lays the spans end to end with no gaps or overlaps", () => {
    for (const cache of ["hit", "miss"] as const) {
      for (const fault of [false, true]) {
        const t = planTrace({ ...base, cache, fault });
        let at = 0;
        for (const s of t.spans) {
          expect(s.start).toBeCloseTo(at, 0);
          expect(s.dur).toBeGreaterThan(0);
          at = s.start + s.dur;
        }
        expect(at).toBeCloseTo(t.total, 0);
        expect(t.key).toMatch(/^req_[0-9a-z]{5}$/);
        expect(t.line).toContain(t.key);
      }
    }
  });

  it("routes there and back, through known lanes, starting and ending at the client", () => {
    for (const cache of ["hit", "miss"] as const) {
      const r = route(planTrace({ ...base, cache, fault: true }));
      expect(r[0]).toBe("client");
      expect(r[r.length - 1]).toBe("client");
      expect(r.every((l) => LANES.includes(l))).toBe(true);
      expect(r.includes("db")).toBe(cache === "miss");
      for (let i = 1; i < r.length; i++) expect(r[i]).not.toBe(r[i - 1]);
    }
  });

  it("positions spans as fractions of the whole, never zero width", () => {
    const t = planTrace({ ...base, cache: "miss", fault: true });
    for (const s of t.spans) {
      const b = spanBox(s, t.total);
      expect(b.left).toBeGreaterThanOrEqual(0);
      expect(b.left + b.width).toBeLessThanOrEqual(1.02);
      expect(b.width).toBeGreaterThan(0);
    }
    expect(spanBox(t.spans[0]!, 0).width).toBeGreaterThan(0);
  });
});

describe("probe run", () => {
  const idle: Input = { targetX: null, dir: 0 };
  const run = (w: ReturnType<typeof createWorld>, seconds: number, input: Input = idle) => {
    for (let i = 0; i < Math.round(seconds / TICK); i++) step(w, TICK, input);
  };

  it("is deterministic: the same seed and inputs give the same run", () => {
    const a = createWorld(42);
    const b = createWorld(42);
    run(a, 12, { targetX: 90, dir: 0 });
    run(b, 12, { targetX: 90, dir: 0 });
    expect(a.score).toBe(b.score);
    expect(a.shield).toBe(b.shield);
    expect(a.objs.map((o) => [o.active, o.x, o.y])).toEqual(b.objs.map((o) => [o.active, o.x, o.y]));
    const c = createWorld(43);
    run(c, 12, { targetX: 90, dir: 0 });
    expect(c.objs.map((o) => o.x)).not.toEqual(a.objs.map((o) => o.x));
  });

  it("steers: a pointer pulls the probe over, the keyboard slides it, and it stays on the field", () => {
    const w = createWorld(1);
    run(w, 2, { targetX: 40, dir: 0 });
    expect(w.shipX).toBeCloseTo(40, 0);
    const k = createWorld(1);
    const x0 = k.shipX;
    run(k, 0.5, { targetX: null, dir: 1 });
    expect(k.shipX).toBeGreaterThan(x0 + 100);
    run(k, 10, { targetX: null, dir: 1 });
    expect(k.shipX).toBeLessThanOrEqual(FIELD_W);
    run(k, 10, { targetX: -999, dir: 0 });
    expect(k.shipX).toBeGreaterThanOrEqual(0);
    // A bad target is ignored rather than corrupting the position.
    run(k, 1, { targetX: NaN, dir: 0 });
    expect(Number.isFinite(k.shipX)).toBe(true);
  });

  it("collecting a shard scores, and hitting debris costs a shield with a grace period", () => {
    const w = createWorld(5);
    w.spawnIn = 99;
    const o = w.objs[0]!;
    Object.assign(o, { active: true, kind: 1, x: w.shipX, y: SHIP_Y - 2, py: SHIP_Y - 2, r: 6, vy: 0, drift: 0, spin: 0 });
    step(w, TICK, idle);
    expect(w.shards).toBe(1);
    expect(o.active).toBe(false);
    expect(w.events.some((e) => e.type === "shard")).toBe(true);

    const d1 = w.objs[1]!;
    Object.assign(d1, { active: true, kind: 0, x: w.shipX, y: SHIP_Y, py: SHIP_Y, r: 10, vy: 0, drift: 0, spin: 0 });
    step(w, TICK, idle);
    expect(w.shield).toBe(SHIELDS - 1);
    expect(w.invuln).toBeGreaterThan(0);

    // A second rock during the grace period passes through.
    const d2 = w.objs[2]!;
    Object.assign(d2, { active: true, kind: 0, x: w.shipX, y: SHIP_Y, py: SHIP_Y, r: 10, vy: 0, drift: 0, spin: 0 });
    step(w, TICK, idle);
    expect(w.shield).toBe(SHIELDS - 1);
  });

  it("ends when the shields are gone, and then stops changing", () => {
    const w = createWorld(9);
    w.spawnIn = 99;
    for (let i = 0; i < SHIELDS; i++) {
      w.invuln = 0;
      Object.assign(w.objs[i]!, { active: true, kind: 0, x: w.shipX, y: SHIP_Y, py: SHIP_Y, r: 10, vy: 0, drift: 0, spin: 0 });
      step(w, TICK, idle);
    }
    expect(w.over).toBe(true);
    expect(w.shield).toBe(0);
    expect(w.events.some((e) => e.type === "over")).toBe(true);
    const tick = w.tick;
    step(w, TICK, idle);
    expect(w.tick).toBe(tick);
  });

  it("gets harder, with a floor on how fast things arrive, and never overflows its pool", () => {
    expect(difficulty(0)).toBe(1);
    expect(difficulty(30)).toBeGreaterThan(difficulty(10));
    expect(difficulty(9999)).toBeLessThanOrEqual(3.2);
    expect(spawnGap(0)).toBeGreaterThan(spawnGap(30));
    expect(spawnGap(9999)).toBeGreaterThanOrEqual(0.24);

    const w = createWorld(3);
    w.shield = 9999; // survive the whole run
    run(w, 90, { targetX: FIELD_W / 2, dir: 0 });
    expect(w.objs).toHaveLength(28);
    expect(w.events.length).toBeLessThanOrEqual(32);
    for (const o of w.objs) if (o.active) expect(o.y).toBeLessThan(FIELD_H + o.r + 1);
  });

  it("scores by shards and by time survived", () => {
    const w = createWorld(2);
    w.spawnIn = 99;
    run(w, 5.05);
    expect(w.score).toBe(5);
    w.shards = 3;
    step(w, TICK, idle);
    expect(w.score).toBe(30 + 5);
  });
});
