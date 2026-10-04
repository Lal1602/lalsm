import { expect, test, type Page } from "@playwright/test";

/**
 * The light theme: a star atlas printed on paper. It is one medium from the top of the page to the
 * bottom (the Playground, Career and Projects used to stay black), and it is never white.
 */

async function arrive(page: Page, lite: "on" | "off" = "off") {
  await page.addInitScript((mode) => localStorage.setItem("lite-mode", mode), lite);
  await page.addInitScript(() => localStorage.setItem("theme-storage", JSON.stringify({ state: { theme: { type: "light", color: "#e4ddcc" } }, version: 0 })));
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () => (document.querySelector<HTMLElement>(".preloader")?.style.display ?? "") === "none",
    null,
    { timeout: 40_000 },
  );
  await page.waitForFunction(() => !document.documentElement.hasAttribute("data-hero"), null, { timeout: 15_000 });
}

async function scrollTo(page: Page, y: number) {
  await page.evaluate((yy) => {
    const lenis = (window as unknown as { __lenis?: { scrollTo(y: number, o: { immediate: boolean }): void } }).__lenis;
    if (lenis) lenis.scrollTo(yy, { immediate: true });
    else window.scrollTo(0, yy);
  }, y);
}

/** Mean luma of the viewport and the share of pixels that are white (every channel above 240). */
async function look(page: Page) {
  const png = (await page.screenshot()).toString("base64");
  return page.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let sum = 0;
    let white = 0;
    let n = 0;
    for (let i = 0; i < data.length; i += 16) {
      sum += data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;
      if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) white++;
      n++;
    }
    return { mean: sum / n, white: white / n };
  }, png);
}

test.describe("light theme: paper", () => {
  test.use({ viewport: { width: 1440, height: 810 } });

  test("no part of the page stays dark, and none of it is white", async ({ page }) => {
    test.setTimeout(240_000);
    await arrive(page);
    expect(await page.evaluate(() => document.documentElement.getAttribute("data-theme"))).toBe("light");
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    const frames: { y: number; mean: number; white: number }[] = [];
    for (let y = 0; y < height - 400; y += 780) {
      await scrollTo(page, y);
      await page.waitForTimeout(1400);
      frames.push({ y, ...(await look(page)) });
    }
    const worst = frames.reduce((a, b) => (b.mean < a.mean ? b : a));
    const brightest = frames.reduce((a, b) => (b.white > a.white ? b : a));
    // Every viewport down the page is paper: even the one over the plates, whose pictures are dark screenshots.
    expect(worst.mean, `darkest viewport at y=${worst.y}`).toBeGreaterThan(150);
    // And none is glare: the old theme's cards and sections were near-white over large areas (15% of a
    // viewport on What I Build alone). What is left is the project pictures, which are content: screenshots
    // of other people's white pages, a few percent of the plates' viewport.
    expect(brightest.white, `whitest viewport at y=${brightest.y}`).toBeLessThan(0.05);
    for (const f of frames) expect(f.mean, `y=${f.y}`).toBeLessThan(235);
  });

  test("the paper follows the sun over Surabaya, and is never lighter than at noon", async ({ page }) => {
    await arrive(page);
    const m = await page.evaluate(() => {
      const root = document.documentElement;
      const hex = (name: string) => root.style.getPropertyValue(name).trim();
      const lin = (c: number) => {
        const s = c / 255;
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      const lum = (h: string) => {
        const n = parseInt(h.slice(1), 16);
        return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
      };
      return { sun: root.getAttribute("data-sun"), p: [0, 1, 2, 3].map((i) => hex(`--p${i}`)), lum: [0, 1, 2, 3].map((i) => lum(hex(`--p${i}`))), rgb: hex("--p1-rgb") };
    });
    expect(Number(m.sun)).toBeGreaterThanOrEqual(-90);
    expect(Number(m.sun)).toBeLessThanOrEqual(90);
    for (const h of m.p) expect(h).toMatch(/^#[0-9a-f]{6}$/);
    // The page paper is never lighter than the noon paper of the stylesheet (#e4ddcc, luminance 0.726).
    expect(m.lum[1]).toBeLessThanOrEqual(0.727);
    expect(m.lum[1]).toBeGreaterThan(0.6);
    expect(m.rgb).toMatch(/^\d+, \d+, \d+$/);
  });

  test("the theme switches by a spreading circle, and back, without leaving the page half-changed", async ({ page }) => {
    await arrive(page);
    const toggle = page.locator(".theme-toggle-switch");
    await toggle.click();
    await expect.poll(() => page.evaluate(() => document.documentElement.getAttribute("data-theme")), { timeout: 5000 }).toBe("dark");
    // Give the transition time to finish: nothing of it may linger.
    await page.waitForTimeout(1300);
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toMatch(/rgb\(5, 5, 5\)/);
    await toggle.click();
    await expect.poll(() => page.evaluate(() => document.documentElement.getAttribute("data-theme")), { timeout: 5000 }).toBe("light");
    await page.waitForTimeout(1300);
    const lum = await look(page);
    expect(lum.mean).toBeGreaterThan(150);
  });

  test("Lite: the Playground is paper without any WebGL", async ({ page }) => {
    await arrive(page, "on");
    await page.evaluate(() => document.querySelector("#playground")!.scrollIntoView());
    await page.waitForTimeout(1200);
    const bg = await page.evaluate(() => getComputedStyle(document.querySelector("#playground")!).backgroundImage);
    // The paper tokens, not the old navy gradient.
    expect(bg).not.toMatch(/11, 13, 48|#0b0d30/i);
    const l = await look(page);
    expect(l.mean).toBeGreaterThan(150);
  });
});

test.describe("light theme: reduced motion", () => {
  test("the theme changes at once", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 810 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await arrive(page);
    await page.locator(".theme-toggle-switch").click();
    await expect.poll(() => page.evaluate(() => document.documentElement.getAttribute("data-theme")), { timeout: 3000 }).toBe("dark");
    await context.close();
  });
});
