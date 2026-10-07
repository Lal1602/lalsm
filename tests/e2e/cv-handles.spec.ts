import { expect, test, type Page } from "@playwright/test";

/**
 * The CV has to be found: handles in the nav, the hero, the edge tab, the contact section and the career slide, all
 * opening the one chooser, and one nudge per visit when the visitor reaches the evidence.
 */

async function arrive(page: Page, lite: "on" | "off" = "off") {
  await page.addInitScript((value) => localStorage.setItem("lite-mode", value), lite);
  await page.goto("/");
  await page.waitForFunction(
    () => (document.querySelector<HTMLElement>(".preloader")?.style.display ?? "") === "none" && !document.documentElement.hasAttribute("data-hero"),
    null,
    { timeout: 60_000 },
  );
}

const tab = (page: Page) => page.locator(".cvd-tab");
const toAchievements = (page: Page) => page.evaluate(() => document.getElementById("achievements")!.scrollIntoView());

test.describe("CV handles", () => {
  test("the navigation bar carries a CV pill, on a wide screen and on a phone, inside the bar", async ({ page }) => {
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await arrive(page);
      const pill = page.locator(".cvd-nav");
      await expect(pill, `${width}`).toBeVisible();
      await expect(pill).toContainText("CV");
      const [bar, box] = await Promise.all([page.locator(".navbar").boundingBox(), pill.boundingBox()]);
      expect(box!.x).toBeGreaterThanOrEqual(bar!.x);
      expect(box!.x + box!.width).toBeLessThanOrEqual(bar!.x + bar!.width);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
  });

  test("the hero has a Download CV button next to the other two, label in full", async ({ page }) => {
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await arrive(page);
      const button = page.locator(".hx-actions .hx-btn-cv");
      await expect(button, `${width}`).toBeVisible();
      await expect(button).toContainText("Download CV");
      // The label's window is as wide as its text: it did not give way to the chips.
      const [windowBox, textWidth] = await Promise.all([
        button.locator(".hx-btn-window").boundingBox(),
        button.locator(".hx-btn-roll > span").first().evaluate((el) => el.scrollWidth),
      ]);
      expect(windowBox!.width).toBeGreaterThanOrEqual(textWidth - 1);
      expect(await page.locator(".hx-actions .hx-btn").count()).toBe(3);
    }
  });

  test("the tab follows the visitor and says what it is when pointed at", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 810 });
    await arrive(page);
    await expect(tab(page)).toBeVisible();
    await expect(tab(page)).toHaveAttribute("aria-label", /Download CV/);
    const box = await tab(page).boundingBox();
    expect(box!.x + box!.width).toBeGreaterThan(1440 - 4); // on the right edge
    await page.mouse.move(box!.x + 8, box!.y + box!.height / 2);
    await expect(tab(page).locator(".cvd-tab-hint")).toContainText("Oct 2026");
    await expect(tab(page).locator(".cvd-tab-out")).toHaveCSS("opacity", "1", { timeout: 3000 });
    // Still there after the page has been scrolled a long way.
    await toAchievements(page);
    await expect(tab(page)).toBeVisible();
  });

  const HANDLES: { name: string; selector: string }[] = [
    { name: "nav", selector: ".cvd-nav" },
    { name: "hero", selector: ".hx-actions .hx-btn-cv" },
    { name: "tab", selector: ".cvd-tab" },
    { name: "contact", selector: ".cvd-inline" },
    { name: "career card", selector: ".cv-download-card .cvd-trigger" },
  ];

  for (const handle of HANDLES) {
    test(`the ${handle.name} handle opens the one chooser, and Escape gives the focus back to it`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 810 });
      await arrive(page);
      const el = page.locator(handle.selector).first();
      await el.evaluate((node: HTMLElement) => node.click());
      await expect(page.getByRole("dialog")).toHaveCount(1);
      await expect(el).toHaveAttribute("aria-expanded", "true");
      await expect(page.locator("a.cvd-card")).toHaveCount(2);
      // Asking again while it is open does not stack a second one.
      await page.locator(".cvd-nav").evaluate((node: HTMLElement) => node.click());
      await expect(page.getByRole("dialog")).toHaveCount(1);
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(el).toBeFocused();
    });
  }

  test("the chooser says how up to date the CV is", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 810 });
    await arrive(page);
    await page.locator(".cvd-nav").evaluate((node: HTMLElement) => node.click());
    await expect(page.locator(".cvd-kicker")).toContainText("UPDATED OCT 2026");
  });

  test("on a phone the drawer has a CV row that opens the chooser", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await arrive(page);
    await page.locator(".menu-toggle-btn").click();
    const row = page.locator(".mobile-btn-cv");
    await expect(row).toBeVisible();
    await row.click();
    await expect(page.getByRole("dialog")).toHaveCount(1);
  });
});

test.describe("the tab's one nudge", () => {
  test("it speaks once when the visitor reaches the achievements, then not again this visit", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 810 });
    await arrive(page);
    await expect(tab(page)).not.toHaveAttribute("data-nudge", "");
    await toAchievements(page);
    await expect(tab(page)).toHaveAttribute("data-nudge", "", { timeout: 5000 });
    await expect(tab(page).locator(".cvd-tab-say")).toContainText("Seen the work?");
    expect(await page.evaluate(() => sessionStorage.getItem("cv-tab-nudged"))).toBe("1");
    // It settles back by itself.
    await expect(tab(page)).not.toHaveAttribute("data-nudge", "", { timeout: 8000 });

    // Same visit, page loaded again: it has already spoken.
    await page.reload();
    await page.waitForFunction(() => (document.querySelector<HTMLElement>(".preloader")?.style.display ?? "") === "none", null, { timeout: 60_000 });
    await toAchievements(page);
    await page.waitForTimeout(1500);
    await expect(tab(page)).not.toHaveAttribute("data-nudge", "");
  });

  test("with reduced motion it never moves by itself", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 810 });
    await arrive(page);
    await toAchievements(page);
    await page.waitForTimeout(2000);
    await expect(tab(page)).not.toHaveAttribute("data-nudge", "");
    expect(await page.evaluate(() => sessionStorage.getItem("cv-tab-nudged"))).toBeNull();
    await expect(tab(page)).toBeVisible();
  });

  test("with Lite on the tab is there, and still", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 810 });
    await arrive(page, "on");
    await toAchievements(page);
    await page.waitForTimeout(2000);
    await expect(tab(page)).toBeVisible();
    await expect(tab(page)).not.toHaveAttribute("data-nudge", "");
  });
});
