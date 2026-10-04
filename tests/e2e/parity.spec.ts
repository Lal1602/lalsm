import { expect, test, type Page } from "@playwright/test";

/**
 * Parity across the ways a visitor can arrive: reduced motion, a phone, the keyboard.
 * Each of these once failed in a way the default desktop run could not see.
 */

async function arrive(page: Page, lite: "on" | "off" = "off") {
  await page.addInitScript((mode) => localStorage.setItem("lite-mode", mode), lite);
  await page.goto("/");
  await page.waitForFunction(
    () => (document.querySelector<HTMLElement>(".preloader")?.style.display ?? "") === "none",
    null,
    { timeout: 40_000 },
  );
}

const scrollTo = (page: Page, id: string) =>
  page.evaluate((i) => {
    const y = document.getElementById(i)!.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, y);
  }, id);

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("hydrates without a mismatch, and the sky holds still", async ({ page }) => {
    // motion's useReducedMotion read the preference on the first client render, so the server's
    // markup (parallax transforms on the sky layers) and the client's differed: React error #418.
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });

    await arrive(page);
    await scrollTo(page, "workflow");
    await expect(page.locator(".fd")).toBeVisible();
    await page.waitForTimeout(600);

    expect(errors.filter((e) => /hydrat|#418|did not match|didn't match/i.test(e))).toEqual([]);
    const transforms = await page.locator(".hiw-layer").evaluateAll((els) => els.map((el) => getComputedStyle(el).transform));
    expect(transforms.every((t) => t === "none")).toBe(true);
  });
});

test.describe("keyboard", () => {
  test("every control in How I Work has a name, and the drag surface is not a tab stop", async ({ page }) => {
    await arrive(page);
    await scrollTo(page, "workflow");
    await expect(page.locator(".fd-st")).toHaveCount(4);

    const unnamed = await page.locator("#workflow").evaluate((section) =>
      [...section.querySelectorAll<HTMLElement>("a[href], button, [role='button'], [tabindex]:not([tabindex='-1'])")]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0 || getComputedStyle(el).visibility === "hidden") return false;
          const name = el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || el.textContent?.trim();
          return !name;
        })
        .map((el) => el.className),
    );
    expect(unnamed).toEqual([]);
    await expect(page.locator(".fd-scrub")).toHaveAttribute("tabindex", "-1");
  });
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  test("the resume link is a full-size tap target", async ({ page }) => {
    await arrive(page);
    await scrollTo(page, "playground");
    const resume = page.getByRole("link", { name: "Get Resume PDF" });
    await expect(resume).toBeVisible();
    const box = (await resume.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);
  });

  test("nothing in How I Work or What I Build pushes the page sideways", async ({ page }) => {
    await arrive(page);
    for (const id of ["about", "workflow"]) {
      await scrollTo(page, id);
      await page.waitForTimeout(400);
      const { scrollWidth, innerWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      expect(scrollWidth, `${id} widened the page`).toBeLessThanOrEqual(innerWidth);
    }
  });
});

test.describe("a short laptop window", () => {
  // 1366x768 minus the browser's own bars leaves about this much.
  test.use({ viewport: { width: 1366, height: 650 } });

  test("What I Build and How I Work each fit in one view, header to the foot of the deck", async ({ page }) => {
    await arrive(page);
    // The fixed nav covers the top ~90px, so what has to fit is everything below it.
    const room = 650 - 96;
    for (const [id, head, deck] of [
      ["about", ".wb-head", ".wb-deck"],
      ["workflow", ".ascent-head", ".ascent"],
    ] as const) {
      await scrollTo(page, id);
      const span = await page.evaluate(
        ([h, d]) => document.querySelector(d)!.getBoundingClientRect().bottom - document.querySelector(h)!.getBoundingClientRect().top,
        [head, deck],
      );
      expect(span, `${id} is ${Math.round(span)}px from header to deck`).toBeLessThanOrEqual(room);
    }
  });

  test("no instrument is clipped by its stage", async ({ page }) => {
    await arrive(page);
    await scrollTo(page, "about");
    for (let i = 0; i < 3; i++) {
      await page.locator(".wb-bay-btn").nth(i).click();
      await page.waitForTimeout(500);
      const over = await page.locator(".wb-stage-in").evaluate((el) => el.scrollHeight - el.clientHeight);
      expect(over, `bay ${i} overflows its stage`).toBeLessThanOrEqual(0);
    }
  });
});
