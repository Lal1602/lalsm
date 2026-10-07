import { expect, test, type Page } from "@playwright/test";

/**
 * Switching theme must not make the page re-style and repaint thousands of elements for no reason: while it
 * happens, nothing transitions (the new theme is final the moment it is applied), and afterwards the ordinary
 * hover and colour transitions are back.
 */

async function arrive(page: Page) {
  await page.addInitScript(() => localStorage.setItem("lite-mode", "off"));
  await page.goto("/");
  await page.waitForFunction(
    () => (document.querySelector<HTMLElement>(".preloader")?.style.display ?? "") === "none" && !document.documentElement.hasAttribute("data-hero"),
    null,
    { timeout: 60_000 },
  );
}

const runningTransitions = (page: Page) =>
  page.evaluate(() => document.getAnimations().filter((a) => a instanceof CSSTransition && a.playState === "running").length);

test.describe("theme switch", () => {
  test("nothing transitions while the theme changes, and the page is back to normal after", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 810 });
    await arrive(page);
    const html = page.locator("html");
    const before = await html.getAttribute("data-theme");

    // Count what is running a frame after the click, in the page itself (the switch is a few hundred ms long).
    const during = await page.evaluate(
      () =>
        new Promise<{ attr: boolean; transitions: number; theme: string | null }>((resolve) => {
          document.querySelector<HTMLButtonElement>(".theme-toggle-switch")!.click();
          requestAnimationFrame(() =>
            requestAnimationFrame(() =>
              resolve({
                attr: document.documentElement.hasAttribute("data-theme-switching"),
                transitions: document.getAnimations().filter((a) => a instanceof CSSTransition && a.playState === "running").length,
                theme: document.documentElement.getAttribute("data-theme"),
              }),
            ),
          );
        }),
    );
    expect(during.theme).not.toBe(before);
    expect(during.attr).toBe(true);
    expect(during.transitions).toBe(0);

    // Over: the flag is gone and the colour transitions work again (a hover starts one).
    await expect(html).not.toHaveAttribute("data-theme-switching", "", { timeout: 4000 });
    await page.locator(".nav-link").first().hover();
    await page.waitForTimeout(60);
    expect(await runningTransitions(page)).toBeGreaterThan(0);
  });

  test("it switches back and forth, and the page keeps its theme across a reload", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 810 });
    await arrive(page);
    const html = page.locator("html");
    const first = await html.getAttribute("data-theme");
    await page.locator(".theme-toggle-switch").click();
    await expect(html).not.toHaveAttribute("data-theme", first!);
    await expect(html).not.toHaveAttribute("data-theme-switching", "", { timeout: 4000 });
    const second = await html.getAttribute("data-theme");
    await page.locator(".theme-toggle-switch").click();
    await expect(html).toHaveAttribute("data-theme", first!);
    await expect(html).not.toHaveAttribute("data-theme-switching", "", { timeout: 4000 });
    await page.locator(".theme-toggle-switch").click();
    await expect(html).toHaveAttribute("data-theme", second!);
  });

  test("with reduced motion the theme simply changes, with no circle and no fades", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 810 });
    await arrive(page);
    const out = await page.evaluate(
      () =>
        new Promise<{ transitions: number; viewTransition: boolean }>((resolve) => {
          document.querySelector<HTMLButtonElement>(".theme-toggle-switch")!.click();
          requestAnimationFrame(() =>
            resolve({
              transitions: document.getAnimations().filter((a) => a instanceof CSSTransition && a.playState === "running").length,
              viewTransition: document.getAnimations().some((a) => String((a.effect as KeyframeEffect | null)?.pseudoElement ?? "").includes("view-transition")),
            }),
          );
        }),
    );
    expect(out.transitions).toBe(0);
    expect(out.viewTransition).toBe(false);
  });
});
