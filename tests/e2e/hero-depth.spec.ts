import { expect, test, type Page } from "@playwright/test";

/**
 * The layers behind and inside the headline: the rings round the full stop, the type-specimen guides,
 * and the lens that shows the skeleton of the letters.
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
}

test.describe("hero: the rings round the portrait", () => {
  test.use({ viewport: { width: 1440, height: 810 } });

  test("two decorative rings, centred on the portrait's disc, whole inside the hero, stopping at the foot's hairline", async ({ page }) => {
    await arrive(page);
    await expect(page.locator(".hx-orbit")).toHaveAttribute("aria-hidden", "true");
    await expect(page.locator(".hx-ring")).toHaveCount(2);
    const m = await page.evaluate(() => {
      const hero = document.querySelector(".hx")!.getBoundingClientRect();
      const disc = document.querySelector(".hx-portrait")!.getBoundingClientRect();
      const orbit = document.querySelector<HTMLElement>(".hx-orbit")!;
      const foot = document.querySelector(".hx-foot")!.getBoundingClientRect();
      return {
        dot: [disc.left + disc.width / 2 - hero.left, disc.top + disc.height / 2 - hero.top],
        heroSize: [hero.width, hero.height],
        reach: (parseFloat(orbit.style.getPropertyValue("--orbit-r")) * 480) / 500 + (parseFloat(orbit.style.getPropertyValue("--orbit-r")) * 96 * 0.7) / 500,
        ring: [parseFloat(orbit.style.getPropertyValue("--ox")), parseFloat(orbit.style.getPropertyValue("--oy"))],
        orbitBottom: orbit.getBoundingClientRect().bottom,
        footTop: foot.top,
      };
    });
    expect(Math.abs(m.dot[0] - m.ring[0])).toBeLessThanOrEqual(3);
    expect(Math.abs(m.dot[1] - m.ring[1])).toBeLessThanOrEqual(3);
    expect(m.orbitBottom).toBeLessThanOrEqual(m.footTop + 2);
    // The outer ring's circle, and the tops of its letters, are all inside the hero: the whole ring is seen.
    expect(m.ring[0] + m.reach).toBeLessThanOrEqual(m.heroSize[0] + 1);
    expect(m.ring[1] - m.reach).toBeGreaterThanOrEqual(0);
    expect(m.ring[1] + m.reach).toBeLessThanOrEqual(m.footTop - 0 + 4);
  });

  test("they say real things", async ({ page }) => {
    await arrive(page);
    const text = (await page.locator(".hx-ring text").allTextContents()).join(" ");
    expect(text).toMatch(/CREATIVE DEVELOPER/);
    expect(text).toMatch(/SURABAYA/);
    expect(text).toMatch(/7\.2756°S/);
    expect(text).not.toMatch(/lorem|ipsum/i);
  });

  test("they turn slowly by themselves, and the nearest one wakes under the pointer", async ({ page }) => {
    await arrive(page);
    const animated = await page.locator(".hx-ring").evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName));
    expect(animated.every((n) => n === "hx-turn")).toBe(true);
    const c = await page.evaluate(() => {
      const o = document.querySelector<HTMLElement>(".hx-orbit")!;
      const hero = document.querySelector(".hx")!.getBoundingClientRect();
      return {
        x: hero.left + parseFloat(o.style.getPropertyValue("--ox")),
        y: hero.top + parseFloat(o.style.getPropertyValue("--oy")),
        r: parseFloat(o.style.getPropertyValue("--orbit-r")),
      };
    });
    // On the inner ring's circle (84% of the outer, drawn at 96% of its box): to the right of the disc's centre.
    await page.mouse.move(c.x + c.r * 0.84 * 0.96, c.y - 20, { steps: 10 });
    await expect(page.locator(".hx-ring[data-lit]")).toHaveCount(1);
  });

  test("scrolling adds turn on top of the slow one, and it settles", async ({ page }) => {
    await arrive(page);
    await page.mouse.move(700, 600);
    for (let i = 0; i < 8; i++) {
      await page.mouse.wheel(0, 220);
      await page.waitForTimeout(30);
    }
    const during = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>(".hx-ring")].map((el) => el.style.rotate));
    expect(during.some((r) => r !== "")).toBe(true);
    // It settles: two reads half a second apart agree. (The page's smooth scroll keeps coasting for a while on a
    // slow machine, and a change of quality tier rebuilds the rings' field, which starts them from rest: so allow a few tries.)
    const read = () => page.evaluate(() => document.querySelector<HTMLElement>(".hx-ring")!.style.rotate);
    let settled = false;
    for (let i = 0; i < 6 && !settled; i++) {
      await page.waitForTimeout(1200);
      const a = await read();
      await page.waitForTimeout(500);
      settled = a === (await read());
    }
    expect(settled).toBe(true);
  });

  test("with Lite on there are no rings, no guides and no lens", async ({ page }) => {
    await arrive(page, "on");
    await expect(page.locator(".hx-orbit")).toHaveCount(0);
    await expect(page.locator(".hx-spec")).toHaveCount(0);
    await expect(page.locator(".hx-lens")).toHaveCount(0);
  });

  test("reduced motion: the rings stay put", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 810 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await arrive(page, "off");
    const names = await page.locator(".hx-ring").evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName));
    expect(names.every((n) => n === "none")).toBe(true);
    await context.close();
  });
});

test.describe("hero: the type specimen", () => {
  test.use({ viewport: { width: 1440, height: 810 } });

  test("a cap line and a baseline for each line of the headline, measured and labelled", async ({ page }) => {
    await arrive(page);
    await expect(page.locator(".hx-guide")).toHaveCount(4);
    const m = await page.evaluate(() => {
      const hero = document.querySelector(".hx")!.getBoundingClientRect();
      const fs = parseFloat(getComputedStyle(document.querySelector("h1.hx-title")!).fontSize);
      const g = [...document.querySelectorAll<HTMLElement>(".hx-guide")].map((el) => ({
        kind: el.dataset.kind,
        y: parseFloat(el.style.top),
        label: el.textContent,
      }));
      const letters = [...document.querySelectorAll("h1.hx-title .hx-ch")].map((el) => el.getBoundingClientRect());
      return { fs, g, firstTop: letters[0].top - hero.top, firstBottom: letters[0].bottom - hero.top };
    });
    expect(m.g.map((x) => x.kind)).toEqual(["cap", "base", "cap", "base"]);
    // Cap height is about 0.7 em, and the label says what was measured.
    const cap = m.g[1].y - m.g[0].y;
    expect(Math.abs(cap - m.fs * 0.7)).toBeLessThanOrEqual(m.fs * 0.03);
    expect(m.g[0].label).toBe(`CAP ${Math.round(cap)}`);
    // Each pair sits inside its line, and the second line is below the first.
    expect(m.g[0].y).toBeGreaterThan(m.firstTop);
    expect(m.g[1].y).toBeLessThan(m.firstBottom + 2);
    expect(m.g[2].y).toBeGreaterThan(m.g[1].y);
  });

  test("the guide nearest the pointer wakes", async ({ page }) => {
    await arrive(page);
    const y = await page.evaluate(() => {
      const hero = document.querySelector(".hx")!.getBoundingClientRect();
      return hero.top + parseFloat(document.querySelectorAll<HTMLElement>(".hx-guide")[1].style.top);
    });
    await page.mouse.move(900, y + 4, { steps: 8 });
    await expect(page.locator(".hx-guide[data-near]")).toHaveCount(1);
    await expect(page.locator(".hx-guide[data-near]")).toHaveAttribute("data-kind", "base");
    await page.mouse.move(900, y + 300, { steps: 6 });
    await expect(page.locator(".hx-guide[data-near]")).toHaveCount(0);
  });
});

test.describe("hero: the lens shows the skeleton of the letters", () => {
  test.use({ viewport: { width: 1440, height: 810 } });

  test("the lit copy carries a constellation per letter, and reads as the same words", async ({ page }) => {
    await arrive(page);
    const m = await page.evaluate(() => ({
      skeletons: document.querySelectorAll(".hx-lens .hx-sk").length,
      nodes: document.querySelectorAll(".hx-lens .hx-node").length,
      text: document.querySelector(".hx-title-lit")!.textContent,
    }));
    expect(m.skeletons).toBe(17);
    expect(m.nodes).toBeGreaterThan(80);
    expect(m.text).toBe("Creative Developer.");
    // None of it is in the real headline, or in what a screen reader is given.
    expect(await page.locator("h1.hx-title .hx-sk").count()).toBe(0);
    await expect(page.locator(".hx-lens")).toHaveAttribute("aria-hidden", "true");
  });

  test("the lens survives a change of tier while the mouse rests on the headline", async ({ page }) => {
    await arrive(page);
    const box = (await page.locator("h1.hx-title").boundingBox())!;
    await page.mouse.move(box.x + 330, box.y + 90, { steps: 12 });
    await expect(page.locator(".hx-lens")).toHaveAttribute("data-on", "");
    // The device is judged to be struggling: the pointer system is rebuilt in a lower mode. The mouse has not moved.
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-q", "3");
      window.dispatchEvent(new Event("lalsm:quality-change"));
    });
    await page.waitForTimeout(600);
    await expect(page.locator(".hx-lens")).toHaveAttribute("data-on", "");
    // And in that lower mode the letters no longer lean: the lens alone.
    const leaning = await page.evaluate(
      () => [...document.querySelectorAll<HTMLElement>("h1.hx-title .hx-ch")].filter((e) => e.style.transform).length,
    );
    expect(leaning).toBe(0);
  });
});
