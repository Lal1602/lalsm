import { expect, test } from "@playwright/test";

/**
 * Each nebula seam is two canvases that meet at the boundary between two sections. At a
 * fractional device pixel ratio that boundary used to land inside a device pixel and left a
 * dark hairline across the screen (see lib/seamGrid). The fix puts the boundaries on a
 * 80 css px grid, which is a whole number of device pixels at every common ratio, so what is
 * tested here is that they are on it, at ratios that used to show the line.
 */

const offGrid = (y: number, grid: number) => {
  const r = ((y % grid) + grid) % grid;
  return Math.min(r, grid - r);
};

const cases = [
  { name: "a laptop at 125% scaling", viewport: { width: 1536, height: 730 }, dpr: 1.25, mobile: false, grid: undefined as number | undefined },
  { name: "a laptop at 150% scaling", viewport: { width: 1280, height: 720 }, dpr: 1.5, mobile: false },
  { name: "a phone at 2.625x", viewport: { width: 390, height: 844 }, dpr: 2.625, mobile: true },
  // A third of a pixel: 80px is 133.3 device pixels here, so the grid widens to 240 (lib/seamGrid).
  { name: "a 2x screen zoomed out to 83% (5/3)", viewport: { width: 1536, height: 730 }, dpr: 1.6667, mobile: false, grid: 240 },
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
    await expect.poll(async () => offGrid((await boundaries()).howIWorkBottom, c.grid ?? 80), { timeout: 10_000 }).toBeLessThan(0.05);
    // The second: the foot of the Playground (its pin, on a wide screen) is the top of Projects.
    await expect.poll(async () => offGrid((await boundaries()).projectsTop, c.grid ?? 80), { timeout: 10_000 }).toBeLessThan(0.05);

    await context.close();
  });
}

/**
 * The seam halves must also agree in tone, not only meet on a whole pixel. In an earlier light theme the
 * two halves were dimmed alike while the Playground stayed dark, which put a pale section against a dark
 * one (a jump from ~207 to ~50), and a theme-coloured vignette brightened only one half of the Projects
 * seam (~5%). The light theme is now paper from top to bottom (the nebula is ink on it), so the two
 * themes are held to the same rule.
 */
for (const theme of ["dark", "light"] as const) {
  test(`no tonal step at either seam in the ${theme} theme`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(() => localStorage.setItem("lite-mode", "off"));
    await page.goto("/");
    await page.waitForFunction(
      () => (document.querySelector<HTMLElement>(".preloader")?.style.display ?? "") === "none",
      null,
      { timeout: 40_000 },
    );
    await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
    await page.waitForTimeout(2500);

    for (const [name, selector, edge] of [
      ["How I Work / Playground", "#workflow", "bottom"],
      ["Playground / Projects", "#projects", "top"],
    ] as const) {
      const boundary = await page.evaluate(
        ([s, e]) => document.querySelector(s)!.getBoundingClientRect()[e as "top" | "bottom"] + window.scrollY,
        [selector, edge],
      );
      // The boundary sits at row 450 of the 900px viewport.
      await page.evaluate((y) => {
        const lenis = (window as unknown as { __lenis?: { scrollTo(y: number, o: { immediate: boolean }): void } }).__lenis;
        if (lenis) lenis.scrollTo(y, { immediate: true });
        else window.scrollTo(0, y);
      }, boundary - 450);
      await page.waitForTimeout(1500);

      const png = (await page.screenshot()).toString("base64");
      const { above, below } = await page.evaluate(async (b64) => {
        const img = new Image();
        img.src = `data:image/png;base64,${b64}`;
        await img.decode();
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const rows = (from: number, to: number) => {
          let sum = 0;
          let n = 0;
          for (let y = from; y <= to; y++) {
            for (let x = 100; x < canvas.width - 100; x += 3) {
              const o = (y * canvas.width + x) * 4;
              sum += data[o] * 0.3 + data[o + 1] * 0.59 + data[o + 2] * 0.11;
              n++;
            }
          }
          return sum / n;
        };
        return { above: rows(445, 448), below: rows(451, 454) };
      }, png);

      const step = Math.abs(below - above) / Math.max(above, below);
      expect(step, `${name}: ${above.toFixed(0)} above, ${below.toFixed(0)} below`).toBeLessThan(0.04);
    }
  });
}
