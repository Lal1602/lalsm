import { expect, test, type Page } from "@playwright/test";

/**
 * The CV download: a button on the career slide that opens a chooser of the two editions, and the facts the CV
 * and the site now state (the e-mail, the languages' levels, no GDGoC).
 */

const EMAIL = "bilalsanayumajid@gmail.com";

async function arrive(page: Page, lite: "on" | "off" = "off") {
  await page.addInitScript((value) => localStorage.setItem("lite-mode", value), lite);
  await page.goto("/");
  await page.waitForFunction(
    () => (document.querySelector<HTMLElement>(".preloader")?.style.display ?? "") === "none",
    null,
    { timeout: 60_000 },
  );
}

/** The career slide has one button for the wide layout and one for the phone layout; only one of them is on screen. */
const triggerOf = (page: Page) =>
  page.locator((page.viewportSize()?.width ?? 1280) > 968 ? ".cv-download-card .cvd-trigger" : ".cv-mobile-download-card .cvd-trigger");

/** The slide that holds the button is pinned and animated in; a click through the DOM is what a keyboard user's Enter is. */
const openChooser = (page: Page) => triggerOf(page).evaluate((el: HTMLElement) => el.click());

test.describe("CV download", () => {
  test("the button opens a chooser of two editions, each its own PDF; Escape closes it and gives focus back", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await arrive(page);
    const trigger = triggerOf(page);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await openChooser(page);
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const cards = dialog.locator("a.cvd-card");
    await expect(cards).toHaveCount(2);
    await expect(cards.nth(0)).toHaveAttribute("href", "/cv.pdf");
    await expect(cards.nth(0)).toHaveAttribute("download", "Bilal-Sanayu-Majid-CV-EN.pdf");
    await expect(cards.nth(1)).toHaveAttribute("href", "/cv-id.pdf");
    await expect(cards.nth(1)).toHaveAttribute("download", "Bilal-Sanayu-Majid-CV-ID.pdf");
    // Each edition says what it holds, from its own data, in its own language.
    await expect(cards.nth(0)).toContainText("5 projects");
    await expect(cards.nth(1)).toContainText("5 proyek");

    // The page behind stands still while it is open, and moves again after.
    expect(await page.evaluate(() => window.__lenis?.isStopped)).toBe(true);
    await expect(cards.first()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(await page.evaluate(() => window.__lenis?.isStopped)).toBe(false);
  });

  test("choosing an edition downloads that PDF, stamps the card, then closes by itself", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await arrive(page);
    await openChooser(page);
    const card = page.locator("a.cvd-card").nth(1);
    const [download] = await Promise.all([page.waitForEvent("download"), card.click()]);
    expect(download.suggestedFilename()).toBe("Bilal-Sanayu-Majid-CV-ID.pdf");
    await expect(card).toHaveAttribute("data-stamped", "");
    await expect(card.locator(".cvd-stamp")).toContainText("Terunduh");
    await expect(page.getByRole("dialog")).toHaveCount(0, { timeout: 5000 });
  });

  test("the keys work: arrows move between the editions, Tab stays inside the chooser", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await arrive(page);
    await openChooser(page);
    const cards = page.locator("a.cvd-card");
    await expect(cards.nth(0)).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(cards.nth(1)).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(cards.nth(0)).toBeFocused();
    // Tab goes card, card, close, and round again: never out to the page behind.
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(page.locator("button.cvd-close")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(cards.nth(0)).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(page.locator("button.cvd-close")).toBeFocused();
  });

  test("on a phone the two editions sit side by side inside the screen", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await arrive(page);
    await openChooser(page);
    await page.waitForTimeout(1500); // dealt out and settled
    await page.mouse.move(5, 5);
    const boxes = await page.locator("a.cvd-card").evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON()));
    expect(boxes).toHaveLength(2);
    for (const b of boxes) {
      expect(b.left).toBeGreaterThanOrEqual(0);
      expect(b.right).toBeLessThanOrEqual(390);
    }
    // Side by side (the lifted, tilted one may overlap its neighbour's edge by a few pixels).
    expect(boxes[0].left).toBeLessThan(boxes[1].left);
    expect(Math.abs(boxes[0].top - boxes[1].top)).toBeLessThan(40);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });

  test("with reduced motion the chooser simply appears: nothing is dealt, swept or struck", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1280, height: 800 });
    await arrive(page);
    await openChooser(page);
    const names = await page.evaluate(() => ({
      card: getComputedStyle(document.querySelector("a.cvd-card")!).animationName,
      dialog: getComputedStyle(document.querySelector(".cvd-dialog")!).animationName,
      sweep: getComputedStyle(document.querySelector(".cvd-sweep")!).display,
    }));
    expect(names).toEqual({ card: "none", dialog: "none", sweep: "none" });
  });
});

test.describe("what the CV and the site now say", () => {
  test("the e-mail is the new one on the CV pages and in the contact section", async ({ page }) => {
    await page.goto("/cv");
    await expect(page.locator(`.cvp-contact a[href="mailto:${EMAIL}"]`)).toBeVisible();
    await page.goto("/cv/id");
    await expect(page.locator(`.cvp-contact a[href="mailto:${EMAIL}"]`)).toBeVisible();
    await arrive(page);
    await expect(page.locator(`a[href="mailto:${EMAIL}"]`).first()).toBeAttached();
    expect(await page.locator('a[href*="bilal.lalsm"]').count()).toBe(0);
  });

  test("no GDGoC; English and BISINDO are Intermediate (Menengah in Indonesian)", async ({ page }) => {
    await page.goto("/cv");
    await expect(page.locator("article.cvp-sheet")).not.toContainText(/GDGoC|Google Developer Groups/i);
    const english = page.locator("section[aria-labelledby=cvp-languages] li", { hasText: /^English/ });
    await expect(english).toContainText("Intermediate");
    await expect(page.locator("section[aria-labelledby=cvp-languages] li", { hasText: "BISINDO" })).toContainText("Intermediate");
    await expect(page.locator("article.cvp-sheet")).not.toContainText(/Level 1|Technical \/ professional/);

    await page.goto("/cv/id");
    await expect(page.locator("article.cvp-sheet")).not.toContainText(/GDGoC|Google Developer Groups/i);
    await expect(page.locator("section[aria-labelledby=cvp-languages] li", { hasText: "Bahasa Inggris" })).toContainText("Menengah");
    await expect(page.locator("section[aria-labelledby=cvp-languages] li", { hasText: "BISINDO" })).toContainText("Menengah");
  });
});
