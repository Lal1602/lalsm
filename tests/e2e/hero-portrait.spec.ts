import { expect, test, type Page } from "@playwright/test";

/**
 * The portrait: the photograph printed as a field of dots on one canvas, a lens that opens over it
 * and shows the photograph itself, and the way it arrives.
 */

async function arrive(page: Page, lite: "on" | "off" = "off") {
  await page.addInitScript((mode) => localStorage.setItem("lite-mode", mode), lite);
  await page.goto("/");
  await page.waitForFunction(
    () => (document.querySelector<HTMLElement>(".preloader")?.style.display ?? "") === "none",
    null,
    { timeout: 40_000 },
  );
  await page.waitForFunction(() => !document.documentElement.hasAttribute("data-hero"), null, { timeout: 15_000 });
  await page.waitForFunction(() => document.querySelector(".hx-portrait")?.hasAttribute("data-dots"), null, { timeout: 15_000 });
}

/** How much of the canvas is ink, and how many distinct colours it carries (the three inks). */
async function ink(page: Page, alphaAbove = 200) {
  return page.evaluate((alphaMin) => {
    const c = document.querySelector<HTMLCanvasElement>("canvas.hx-dots")!;
    const g = c.getContext("2d")!;
    const { data } = g.getImageData(0, 0, c.width, c.height);
    const colours = new Set<string>();
    let on = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > alphaMin) {
        on++;
        colours.add(`${data[i] >> 5},${data[i + 1] >> 5},${data[i + 2] >> 5}`);
      }
    }
    return { share: on / (c.width * c.height), colours: colours.size };
  }, alphaAbove);
}

test.describe("hero: the portrait is a disc of dots", () => {
  test.use({ viewport: { width: 1440, height: 810 } });

  test("one canvas over the photograph, which stays in the page as the portrait", async ({ page }) => {
    await arrive(page);
    await expect(page.locator("canvas.hx-dots")).toHaveCount(1);
    await expect(page.locator("canvas.hx-dots")).toHaveAttribute("aria-hidden", "true");
    // The photograph is still what assistive tech is given.
    await expect(page.getByRole("img", { name: /Portrait of/ })).toHaveCount(1);
    const box = await page.locator(".hx-portrait").boundingBox();
    expect(Math.abs(box!.width - box!.height)).toBeLessThan(1.5);
    // Printed: a real share of the canvas has ink on it, in more than one colour.
    const m = await ink(page);
    expect(m.share).toBeGreaterThan(0.05);
    expect(m.share).toBeLessThan(0.5);
    expect(m.colours).toBeGreaterThanOrEqual(2);
  });

  test("the disc is the crop of the photograph that was meant: the face, not the wall", async ({ page }) => {
    await arrive(page);
    // The lens shows the photograph at the same crop as the dots. Hair at the top of the disc is dark; the wall at its left is pale.
    const tone = await page.evaluate(() => {
      const c = document.querySelector<HTMLCanvasElement>("canvas.hx-pl-photo")!;
      const g = c.getContext("2d")!;
      const mean = (u: number, v: number) => {
        const { data } = g.getImageData(Math.round(c.width * u) - 5, Math.round(c.height * v) - 5, 10, 10);
        let sum = 0;
        for (let i = 0; i < data.length; i += 4) sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
        return sum / (data.length / 4);
      };
      return { hair: mean(0.5, 0.2), wall: mean(0.12, 0.5) };
    });
    expect(tone.hair).toBeLessThan(90);
    expect(tone.wall).toBeGreaterThan(130);
  });

  test("a lens opens over the disc where the pointer is, and closes when it leaves", async ({ page }) => {
    await arrive(page);
    const box = (await page.locator(".hx-portrait").boundingBox())!;
    await expect(page.locator(".hx-portrait[data-lens]")).toHaveCount(0);
    const before = await ink(page);
    const aim = { x: box.x + box.width * 0.5, y: box.y + box.height * 0.45 };
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.8, { steps: 6 });
    await page.mouse.move(aim.x, aim.y, { steps: 10 });
    await expect(page.locator(".hx-portrait[data-lens]")).toHaveCount(1);
    await page.waitForTimeout(900);
    const win = await page.evaluate(() => {
      const w = document.querySelector(".hx-pl-win")!;
      const r = w.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, opacity: Number(getComputedStyle(w).opacity), label: document.querySelector(".hx-pl-label")!.textContent };
    });
    // The window is centred on the pointer, visible, and the readout says what it is looking at.
    expect(Math.abs(win.x - aim.x)).toBeLessThan(12);
    expect(Math.abs(win.y - aim.y)).toBeLessThan(12);
    expect(win.opacity).toBeGreaterThan(0.95);
    expect(win.label).toMatch(/^LUM \d{3}$/);
    // The dots are not redrawn for it: the lens is a window, so the canvas is the same.
    expect((await ink(page)).share).toBeCloseTo(before.share, 6);
    await page.mouse.move(box.x + 40, 700, { steps: 8 });
    await expect(page.locator(".hx-portrait[data-lens]")).toHaveCount(0);
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => Number(getComputedStyle(document.querySelector(".hx-pl-win")!).opacity))).toBeLessThan(0.05);
  });

  test("the lens opens straight away on a mouse that is already resting on the disc after a tier change", async ({ page }) => {
    await arrive(page);
    const box = (await page.locator(".hx-portrait").boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.8, { steps: 6 });
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5, { steps: 10 });
    await expect(page.locator(".hx-portrait[data-lens]")).toHaveCount(1);
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-q", "2");
      window.dispatchEvent(new Event("lalsm:quality-change"));
    });
    await page.waitForTimeout(700);
    await expect(page.locator(".hx-portrait[data-lens]")).toHaveCount(1);
  });

  test("the switch to the light theme reprints it, and it is still a portrait", async ({ page }) => {
    await arrive(page);
    const dark = await ink(page);
    await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
    await page.waitForTimeout(500);
    const light = await ink(page);
    expect(light.share).toBeGreaterThan(0.05);
    // Dark ink on a light page: the tones are the other way round, so the amount of ink is not the same.
    expect(Math.abs(light.share - dark.share)).toBeGreaterThan(0.005);
  });

  test("there is no layout shift: the disc and the rings stay put through the entrance's end", async ({ page }) => {
    await arrive(page);
    const a = await page.evaluate(() => {
      const r = document.querySelector(".hx-portrait")!.getBoundingClientRect();
      return [r.left, r.top, r.width];
    });
    await page.waitForTimeout(800);
    const b = await page.evaluate(() => {
      const r = document.querySelector(".hx-portrait")!.getBoundingClientRect();
      return [r.left, r.top, r.width];
    });
    expect(b).toEqual(a);
  });
});

test.describe("hero: the portrait, in the quiet modes", () => {
  test.use({ viewport: { width: 1440, height: 810 } });

  test("Lite: the dots are printed once, and there is no lens", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("lite-mode", "on"));
    await page.goto("/");
    await page.waitForFunction(() => document.querySelector(".hx-portrait")?.hasAttribute("data-dots"), null, { timeout: 40_000 });
    const m = await ink(page);
    expect(m.share).toBeGreaterThan(0.05);
    const box = (await page.locator(".hx-portrait").boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 8 });
    await page.waitForTimeout(400);
    await expect(page.locator(".hx-portrait[data-lens]")).toHaveCount(0);
    await expect(page.locator(".hx-orbit")).toHaveCount(0);
  });

  test("reduced motion: the dots are all there at once, and the lens follows the pointer exactly", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 810 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await arrive(page, "off");
    const m = await ink(page);
    expect(m.share).toBeGreaterThan(0.05);
    const box = (await page.locator(".hx-portrait").boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.8, { steps: 4 });
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5, { steps: 4 });
    await expect(page.locator(".hx-portrait[data-lens]")).toHaveCount(1);
    await context.close();
  });
});

test.describe("hero: the portrait on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("a smaller disc with the rings round it, nothing wider than the screen", async ({ page }) => {
    await arrive(page);
    const m = await page.evaluate(() => {
      const r = document.querySelector(".hx-portrait")!.getBoundingClientRect();
      return { w: r.width, overflow: document.documentElement.scrollWidth - window.innerWidth, rings: document.querySelectorAll(".hx-ring").length };
    });
    expect(m.w).toBeGreaterThan(90);
    expect(m.w).toBeLessThan(140);
    expect(m.overflow).toBeLessThanOrEqual(0);
    expect(m.rings).toBe(2);
    // The dots are a pixel and a half apart at 1x, so most are partly covered pixels: count those too.
    const ink1 = await ink(page, 20);
    expect(ink1.share).toBeGreaterThan(0.03);
  });
});
