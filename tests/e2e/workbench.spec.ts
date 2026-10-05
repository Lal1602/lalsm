import { expect, test } from "@playwright/test";

test.describe("what I build (systems bay)", () => {
  type P = import("@playwright/test").Page;

  async function arrive(page: P, atTop = 100) {
    await page.goto("/");
    await page.waitForFunction(
      () => (document.querySelector<HTMLElement>(".preloader")?.style.display ?? "") === "none",
      null,
      { timeout: 40_000 },
    );
    await page.evaluate((top) => {
      const r = document.querySelector(".wb-deck")!.getBoundingClientRect();
      window.scrollTo(0, window.scrollY + r.top - top);
    }, atTop);
    await expect(page.locator(".wb-stage")).toBeVisible();
  }

  const bay = (page: P, i: number) => page.locator(".wb-bay-btn").nth(i);
  const num = async (page: P, selector: string) => Number(await page.locator(selector).first().textContent());

  test("three bays, and exactly one instrument open at a time", async ({ page }) => {
    await arrive(page);
    await expect(page.locator(".wb-bay-btn")).toHaveCount(3);
    await expect(page.locator(".wb-stage")).toHaveCount(1);
    await expect(bay(page, 0)).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(".wb-meter")).toBeVisible();
    // Every bay is described on the page without opening anything.
    await expect(page.locator(".wb-bay-name")).toHaveText([/Frontend\s+Engineering/, /Backend\s*&\s*DevOps/, /Mobile\s*&\s*Game Dev/]);
    await expect(page.locator(".wb-stack").first()).toContainText("TypeScript");

    await bay(page, 1).click();
    await expect(bay(page, 1)).toHaveAttribute("aria-expanded", "true");
    await expect(bay(page, 0)).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator(".wb-trace")).toBeVisible();
    await expect(page.locator(".wb-meter")).toHaveCount(0);

    // The arrow keys move between bays and open them.
    await bay(page, 1).focus();
    await page.keyboard.press("ArrowDown");
    await expect(bay(page, 2)).toHaveAttribute("aria-expanded", "true");
    await expect(bay(page, 2)).toBeFocused();
    await expect(page.locator(".wb-game")).toBeVisible();
    await page.keyboard.press("Home");
    await expect(bay(page, 0)).toHaveAttribute("aria-expanded", "true");
  });

  test("the frame meter measures real frames, and a load shows up in it, then lets go", async ({ page }) => {
    await arrive(page);
    await expect.poll(() => num(page, ".wb-stat--big b"), { timeout: 8_000 }).toBeGreaterThan(5);
    const heavy = page.locator(".wb-seg-btn").nth(2);
    await heavy.click();
    await expect(heavy).toHaveAttribute("aria-pressed", "true");
    // Thirty milliseconds of work in every frame: the p95 frame time has to be at least that.
    await expect.poll(() => num(page, ".wb-meter-read .wb-stat:nth-child(3) b"), { timeout: 8_000 }).toBeGreaterThan(28);
    await expect(page.locator(".wb-meter-read")).toHaveAttribute("data-grade", "bad");
    // Let the average settle under load, then compare with what it reads once the load has let go.
    await page.waitForTimeout(1500);
    const loaded = await num(page, ".wb-meter-read .wb-stat:nth-child(2) b");
    // It always lets go by itself. (Absolute numbers depend on the machine; the drop does not.)
    await expect(page.locator(".wb-seg-btn").first()).toHaveAttribute("aria-pressed", "true", { timeout: 10_000 });
    await expect.poll(() => num(page, ".wb-meter-read .wb-stat:nth-child(2) b"), { timeout: 8_000 }).toBeLessThan(loaded - 8);
  });

  test("the request trace: a warm cache never reaches the database, a cold one with a failing database retries", async ({ page }) => {
    await arrive(page);
    await bay(page, 1).click();
    const status = page.locator(".wb-trace-status");
    await expect(status).toHaveText("200 OK", { timeout: 10_000 });
    await expect(page.locator(".wb-span")).toHaveCount(5);
    await expect(page.locator('.wb-span[data-lane="db"]')).toHaveCount(0);
    await expect(page.locator(".wb-node[data-skipped]")).toHaveCount(1);
    await expect(page.locator(".wb-trace-note")).toContainText("never asked");

    // A failing database does not matter to a warm cache.
    await page.getByRole("button", { name: /Times out/ }).click();
    await expect(status).toHaveText("200 OK", { timeout: 10_000 });
    await expect(page.locator('.wb-span[data-ok="false"]')).toHaveCount(0);
    await expect(page.locator(".wb-trace-note")).toContainText("outage did not touch");

    // Cold: one failed attempt, a back-off and a retry, and still a 200.
    await page.getByRole("button", { name: /Cold/ }).click();
    await expect(status).toHaveText("200 OK", { timeout: 10_000 });
    await expect(page.locator('.wb-span[data-ok="false"]')).toHaveCount(1);
    await expect(page.locator('.wb-span[data-lane="db"]')).toHaveCount(2);
    await expect(page.locator(".wb-span[data-idle]")).toHaveCount(1);
    await expect(page.locator(".wb-node[data-bad]")).toHaveCount(1);
    await expect(page.locator(".wb-trace-note")).toContainText("timed out");
    await expect(page.locator(".wb-log li").first()).toContainText("cache miss, 2 db attempts");
  });

  test("the game starts only when asked, runs a fixed-step loop, and steers from the keyboard", async ({ page }) => {
    await arrive(page);
    await bay(page, 2).click();
    const game = page.locator(".wb-game");
    await expect(game).toHaveAttribute("data-phase", "ready");
    // Nothing runs until Launch: the clocks have not been read yet.
    await expect(page.locator(".wb-loop-row em").nth(1)).toHaveText("--");

    await game.getByRole("button", { name: "Launch", exact: true }).click();
    await expect(game).toHaveAttribute("data-phase", "play");
    await expect(page.locator(".wb-field")).toBeFocused();
    await page.keyboard.down("ArrowLeft");
    await page.waitForTimeout(700);
    await page.keyboard.up("ArrowLeft");
    // Both clocks report. The simulation never steps faster than its fixed 60 ticks a second,
    // however fast the display draws (how far below it falls depends on the machine).
    await expect.poll(() => num(page, ".wb-loop-row:nth-child(2) em"), { timeout: 8_000 }).toBeGreaterThan(3);
    const ticks = await num(page, ".wb-loop-row em");
    expect(ticks).toBeGreaterThan(3);
    expect(ticks).toBeLessThanOrEqual(61);
    await expect.poll(() => num(page, ".wb-game-stats div:nth-child(3) b"), { timeout: 8_000 }).toBeGreaterThanOrEqual(1);
  });

  test("with Lite on, an instrument's result simply appears", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("lite-mode", "on"));
    await arrive(page);
    await bay(page, 1).click();
    await expect(page.locator(".wb-trace-status")).toHaveText("200 OK", { timeout: 3_000 });
    await expect(page.locator(".wb-packet")).toHaveCSS("opacity", "0");
  });

  test("on a phone it is three plain cards: no instruments, nothing to open, nothing overflowing", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForFunction(() => (document.querySelector<HTMLElement>(".preloader")?.style.display ?? "") === "none", null, { timeout: 40_000 });
    await page.evaluate(() => {
      const r = document.querySelector(".wb-deck")!.getBoundingClientRect();
      window.scrollTo(0, window.scrollY + r.top - 60);
    });

    // The three cards, each with its brief and its stack, and nothing else: no stage, no instrument, no button.
    await expect(page.locator(".wb-bay")).toHaveCount(3);
    await expect(page.locator(".wb-bay-name")).toHaveText([/Frontend\s+Engineering/, /Backend\s*&\s*DevOps/, /Mobile\s*&\s*Game Dev/]);
    await expect(page.locator(".wb-stack").first()).toContainText("TypeScript");
    await expect(page.locator(".wb-stage")).toHaveCount(0);
    await expect(page.locator("button.wb-bay-btn")).toHaveCount(0);
    await expect(page.locator(".wb-bay-live")).toHaveCount(0);
    // The heading no longer promises instruments it does not show.
    const eyebrow = await page.locator(".wb-eyebrow").innerText();
    expect(eyebrow).toMatch(/THREE DISCIPLINES/i);
    expect(eyebrow).not.toMatch(/INSTRUMENTS/i);
    expect(await page.locator(".wb-lede").innerText()).not.toMatch(/instrument/i);

    // A card is a card: a border, inside the screen's width, every one the same width.
    const cards = await page.locator(".wb-bay").evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { left: Math.round(r.left), right: Math.round(r.right), border: getComputedStyle(el).borderTopWidth };
      }),
    );
    for (const c of cards) {
      expect(c.border).toBe("1px");
      expect(c.left).toBeGreaterThanOrEqual(0);
      expect(c.right).toBeLessThanOrEqual(390);
    }
    expect(new Set(cards.map((c) => c.right - c.left)).size).toBe(1);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await context.close();
  });
});
