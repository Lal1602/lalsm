import { expect, test } from "@playwright/test";

/**
 * Each nebula seam is two canvases that meet at the boundary between two sections. At a
 * fractional device pixel ratio that boundary used to land inside a device pixel and left a
 * dark hairline across the screen (see lib/seamGrid). The fix puts the boundaries on a
 * 80 css px grid, which is a whole number of device pixels at every common ratio, so what is
 * tested here is that they are on it, at ratios that used to show the line.
 */

const GRID = 80;
const offGrid = (y: number) => {
  const r = ((y % GRID) + GRID) % GRID;
  return Math.min(r, GRID - r);
};

const cases = [
  { name: "a laptop at 125% scaling", viewport: { width: 1536, height: 730 }, dpr: 1.25, mobile: false },
  { name: "a laptop at 150% scaling", viewport: { width: 1280, height: 720 }, dpr: 1.5, mobile: false },
  { name: "a phone at 2.625x", viewport: { width: 390, height: 844 }, dpr: 2.625, mobile: true },
];

for (const c of cases) {
  test(`the seams between sections sit on whole device pixels: ${c.name}`, async ({ browser }) => {
    const context = await browser.newContext({
      viewport: c.viewport,
      deviceScaleFactor: c.dpr,
      isMobile: c.mobile,
      hasTouch: c.mobile,
    });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForFunction(
      () => (document.querySelector<HTMLElement>(".preloader")?.style.display ?? "") === "none",
      null,
      { timeout: 40_000 },
    );

    const boundaries = () =>
      page.evaluate(() => {
        const at = (selector: string, edge: "top" | "bottom") => {
          const r = document.querySelector(selector)!.getBoundingClientRect();
          return r[edge] + window.scrollY;
        };
        return { howIWorkBottom: at("#workflow", "bottom"), projectsTop: at("#projects", "top") };
      });

    // The first seam: the foot of How I Work (which is also the top of the Playground).
    await expect.poll(async () => offGrid((await boundaries()).howIWorkBottom), { timeout: 10_000 }).toBeLessThan(0.05);
    // The second: the foot of the Playground (its pin, on a wide screen) is the top of Projects.
    await expect.poll(async () => offGrid((await boundaries()).projectsTop), { timeout: 10_000 }).toBeLessThan(0.05);

    await context.close();
  });
}
