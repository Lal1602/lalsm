import { expect, test, type Page } from "@playwright/test";

/**
 * The splash screen ("First Light"). Two promises: it is the first thing the visitor sees, before any script
 * has run (the hero used to show first, then the preloader arrived), and the work behind it is real (the dial
 * reports the warm-up pipeline, and what it warmed is not left to the first scroll).
 */

const gone = () => (document.querySelector<HTMLElement>(".preloader")?.style.display ?? "") === "none";

async function setup(page: Page, opts: { lite?: "on" | "off"; theme?: "dark" | "light"; delayChunks?: number } = {}) {
  await page.addInitScript(
    ([lite, theme]) => {
      localStorage.setItem("lite-mode", lite);
      localStorage.setItem("theme-storage", JSON.stringify({ state: { theme: { type: theme, color: theme === "light" ? "#e4ddcc" : "#050505" } }, version: 0 }));
    },
    [opts.lite ?? "off", opts.theme ?? "dark"] as const,
  );
  if (opts.delayChunks) {
    // The page's own scripts arrive late: whatever is on screen meanwhile is what a slow visitor sees.
    await page.route("**/_next/static/chunks/**", async (route) => {
      await new Promise((r) => setTimeout(r, opts.delayChunks));
      await route.continue();
    });
  }
}

/** True when each of nine points of the viewport is covered by the splash (and not by the page behind it). */
async function coveredEverywhere(page: Page) {
  return page.evaluate(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const points = [0.02, 0.5, 0.98].flatMap((x) => [0.02, 0.5, 0.98].map((y) => [x * w, y * h] as const));
    return points.map(([x, y]) => !!document.elementFromPoint(x, y)?.closest(".preloader"));
  });
}

test.describe("the splash is the first thing painted", () => {
  test.use({ viewport: { width: 1440, height: 810 } });

  for (const mode of ["full", "lite"] as const) {
    test(`${mode}: it covers the page before any script has run`, async ({ page }) => {
      await setup(page, { lite: mode === "lite" ? "on" : "off", delayChunks: 2500 });
      await page.goto("/", { waitUntil: "domcontentloaded" });
      // The scripts that make the page are still on their way (every chunk is held back 2.5s).
      expect(await page.evaluate(gone)).toBe(false);
      expect(await coveredEverywhere(page)).toEqual(Array(9).fill(true));
      // The page behind is locked and starts at the top, from the first paint.
      const locked = await page.evaluate(() => ({
        splash: document.documentElement.getAttribute("data-splash"),
        overflow: getComputedStyle(document.body).overflow,
        y: window.scrollY,
        value: document.querySelector(".preloader")?.getAttribute("aria-valuenow"),
      }));
      expect(locked).toEqual({ splash: "1", overflow: "hidden", y: 0, value: "0" });
      await page.waitForFunction(gone, null, { timeout: 40_000 });
    });
  }

  test("reduced motion: the same, and no hero shows through while it waits", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 810 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await setup(page, { delayChunks: 2000 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(await coveredEverywhere(page)).toEqual(Array(9).fill(true));
    await page.waitForFunction(gone, null, { timeout: 40_000 });
    await context.close();
  });

  test("scripts off: there is nothing to lift it, so it is not shown", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 810 }, javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(await page.locator(".preloader").evaluate((el) => getComputedStyle(el).display)).toBe("none");
    await expect(page.locator("#home")).toBeVisible();
    await context.close();
  });

  test("light theme: it is paper, not a black card", async ({ page }) => {
    await setup(page, { theme: "light", delayChunks: 1500 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const bg = await page.locator(".preloader").evaluate((el) => getComputedStyle(el).backgroundColor);
    // The paper ramp (--p1 at noon is #e4ddcc; at night it is dimmed a few percent), never black and never white.
    const [r, g, b] = bg.match(/\d+/g)!.map(Number);
    expect(r).toBeGreaterThan(200);
    expect(r).toBeLessThan(240);
    expect(g).toBeGreaterThan(190);
    expect(b).toBeGreaterThan(170);
    await page.waitForFunction(gone, null, { timeout: 40_000 });
  });
});

test.describe("the work behind it is real", () => {
  test.use({ viewport: { width: 1440, height: 810 } });

  test("the counter only rises, the arcs lock as systems finish, and it ends at 100", async ({ page }) => {
    test.setTimeout(70_000);
    await setup(page);
    // The splash is in the document that arrives, so it is there to be sampled from the first moment.
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const seen: number[] = [];
    const reads = new Set<string>();
    let lastError = "";
    const started = Date.now();
    while (Date.now() - started < 45_000) {
      const s = await page
        .evaluate(() => {
          const p = document.querySelector(".preloader");
          if (!p) return null;
          return { now: Number(p.getAttribute("aria-valuenow")), gone: (p as HTMLElement).style.display === "none", read: p.querySelector("[data-pl=read]")?.textContent ?? "" };
        })
        .catch((error: Error) => {
          lastError = error.message;
          return null;
        });
      if (s) {
        seen.push(s.now);
        reads.add(s.read);
        if (s.gone) break;
      }
      await page.waitForTimeout(120);
    }
    expect(seen.length, `samples taken (last error: ${lastError || "none"})`).toBeGreaterThan(3);
    for (let i = 1; i < seen.length; i++) expect(seen[i], `sample ${i}`).toBeGreaterThanOrEqual(seen[i - 1]);
    expect(seen[seen.length - 1]).toBe(100);

    // Every system is accounted for: locked, or marked as having fallen back. None is left pending.
    const arcs = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[data-pl="stage"] .pl-arc')).map((a) => (a.classList.contains("is-locked") ? "locked" : a.classList.contains("is-late") ? "late" : "pending")),
    );
    expect(arcs).toHaveLength(8);
    expect(arcs).not.toContain("pending");
    expect(arcs.filter((a) => a === "locked").length).toBeGreaterThanOrEqual(5);
    // The readout named real systems, as they locked.
    expect([...reads].some((r) => /^LOCKED ·/i.test(r))).toBe(true);
  });

  test("when it opens, the page is handed back: unlocked, at the top, nothing left inert", async ({ page }) => {
    await setup(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(gone, null, { timeout: 40_000 });
    const state = await page.evaluate(() => ({
      splash: document.documentElement.getAttribute("data-splash"),
      overflow: document.body.style.overflow,
      y: window.scrollY,
      inert: document.getElementById("main-content-wrapper")?.hasAttribute("inert"),
      halves: document.querySelectorAll(".pl-half").length,
    }));
    expect(state).toEqual({ splash: null, overflow: "", y: 0, inert: false, halves: 0 });
    await page.evaluate(() => {
      const lenis = (window as unknown as { __lenis?: { scrollTo(y: number, o: { immediate: boolean }): void } }).__lenis;
      if (lenis) lenis.scrollTo(900, { immediate: true });
      else window.scrollTo(0, 900);
    });
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
  });

  test("every seam has already been drawn when it opens: none shows its fallback on arrival", async ({ page }) => {
    test.setTimeout(70_000);
    await setup(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(gone, null, { timeout: 40_000 });
    const seams = await page.evaluate(() => Array.from(document.querySelectorAll("[data-kind][data-part]")).map((s) => s.getAttribute("data-ready")));
    expect(seams.length).toBe(4);
    expect(seams).toEqual(Array(4).fill("true"));
  });

  test("the hero's entrance is the dot-matrix one, not the plain wipe", async ({ page }) => {
    await setup(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(gone, null, { timeout: 40_000 });
    // The portrait's dots were waited for, so they exist by the time the curtain has opened.
    await expect(page.locator(".hx-portrait[data-dots]")).toHaveCount(1);
  });
});
