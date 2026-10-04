import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

/**
 * Scrolls the whole home page at a steady pace on a CPU-throttled page and
 * records frame times per section.
 *
 * What this can and cannot tell you: it measures main-thread and compositor
 * pacing as the browser reports it. In headless Chrome the GL stack may be a
 * software rasteriser, so absolute GPU cost is NOT representative — use these
 * numbers to compare one phase against the next on the same machine, and judge
 * GPU-bound smoothness in a real browser (see the renderer string in the output).
 */

const SECTIONS: string[] = ["home", "about", "workflow", "playground", "projects", "achievements", "contact"];

/** p95 budget in ms at 4x CPU throttle. 60fps is 16.7; throttled we accept 2 frames. */
const BUDGET_P95_MS = 33.4;
const THROTTLE = Number(process.env.PERF_THROTTLE || 4);

interface Row {
  section: string;
  frames: number;
  p50: number;
  p95: number;
  max: number;
  over17: number;
  over34: number;
}

function pct(sorted: number[], p: number) {
  if (sorted.length === 0) return 0;
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
}

test("frame budget while scrolling every section", async ({ page, browserName }, testInfo) => {
  test.skip(browserName !== "chromium", "CDP throttling needs Chromium");

  await page.goto("/");
  // The preloader locks scrolling until it leaves.
  await page.waitForFunction(
    () => (document.querySelector<HTMLElement>(".preloader")?.style.display ?? "") === "none",
    null,
    { timeout: 30_000 },
  );
  await page.waitForTimeout(1500);

  const renderer = await page.evaluate(() => {
    const gl = document.createElement("canvas").getContext("webgl");
    const ext = gl?.getExtension("WEBGL_debug_renderer_info");
    return gl && ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "no webgl";
  });

  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: THROTTLE });

  await page.evaluate((ids) => {
    const w = window as unknown as { __frames: Array<[string, number]>; __sampling: boolean };
    w.__frames = [];
    w.__sampling = true;
    let last = performance.now();
    const section = () => {
      const el = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
      const hit = el?.closest("section[id], header[id], div[id]");
      let node: Element | null = hit ?? null;
      while (node && !ids.includes(node.id)) node = node.parentElement?.closest("[id]") ?? null;
      return node?.id ?? "other";
    };
    const tick = (now: number) => {
      if (!w.__sampling) return;
      const delta = now - last;
      last = now;
      if (delta < 500) w.__frames.push([section(), delta]);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [...SECTIONS]);

  const total = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  await page.mouse.move(720, 450);
  // ~900px/s in wheel steps: a brisk but ordinary read-through.
  for (let y = 0; y < total; y += 90) {
    await page.mouse.wheel(0, 90);
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(800);

  const frames = await page.evaluate(() => {
    const w = window as unknown as { __frames: Array<[string, number]>; __sampling: boolean };
    w.__sampling = false;
    return w.__frames;
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });

  const rows: Row[] = [];
  for (const id of [...SECTIONS, "other"]) {
    const d = frames.filter(([s]) => s === id).map(([, ms]) => ms).sort((a, b) => a - b);
    if (d.length === 0) continue;
    rows.push({
      section: id,
      frames: d.length,
      p50: +pct(d, 50).toFixed(1),
      p95: +pct(d, 95).toFixed(1),
      max: +d[d.length - 1].toFixed(1),
      over17: +((d.filter((x) => x > 17.5).length / d.length) * 100).toFixed(1),
      over34: +((d.filter((x) => x > 34).length / d.length) * 100).toFixed(1),
    });
  }

  const label = process.env.PERF_LABEL || "latest";
  mkdirSync("test-results", { recursive: true });
  writeFileSync(
    `test-results/perf-${label}.json`,
    JSON.stringify({ label, renderer, throttle: THROTTLE, budgetP95: BUDGET_P95_MS, rows }, null, 2),
  );

  console.log(`\nrenderer: ${renderer}   cpu throttle: ${THROTTLE}x   label: ${label}`);
  console.log("section".padEnd(14), "frames".padStart(7), "p50".padStart(7), "p95".padStart(7), "max".padStart(8), ">17ms%".padStart(8), ">34ms%".padStart(8));
  for (const r of rows) {
    console.log(
      r.section.padEnd(14),
      String(r.frames).padStart(7),
      String(r.p50).padStart(7),
      String(r.p95).padStart(7),
      String(r.max).padStart(8),
      String(r.over17).padStart(8),
      String(r.over34).padStart(8),
    );
  }

  testInfo.annotations.push({ type: "renderer", description: renderer });

  if (process.env.PERF_ASSERT) {
    for (const r of rows.filter((x) => x.frames > 30)) {
      expect(r.p95, `${r.section} p95 frame time`).toBeLessThanOrEqual(BUDGET_P95_MS);
    }
  }
});
