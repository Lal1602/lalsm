import { expect, test, type Page } from "@playwright/test";

/**
 * The hero: a headline at the size of the page, a lens that follows the pointer over it, and a
 * sequence that plays as the preloader's curtain lifts.
 */

async function arrive(page: Page, lite: "on" | "off" | "auto" = "off") {
  if (lite !== "auto") await page.addInitScript((mode) => localStorage.setItem("lite-mode", mode), lite);
  await page.goto("/");
  await page.waitForFunction(
    () => (document.querySelector<HTMLElement>(".preloader")?.style.display ?? "") === "none",
    null,
    { timeout: 40_000 },
  );
  // The entrance releases <html data-hero> when it has finished (a calm visitor never gets it).
  await page.waitForFunction(() => !document.documentElement.hasAttribute("data-hero"), null, { timeout: 15_000 });
}

test.describe("hero", () => {
  test("one h1 named for the role, first on the page, and its text reads normally", async ({ page }) => {
    await arrive(page);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveAttribute("aria-label", "Creative Developer");
    await expect(page.locator("h1").first()).toContainText(/creative developer/i);
    // The letters are set in capitals by CSS, not in the text.
    expect(await page.locator("h1").first().textContent()).toMatch(/Creative\s+Developer\./);
  });

  test("the entrance ends with everything shown and nothing left behind", async ({ page }) => {
    await arrive(page);
    const state = await page.evaluate(() => {
      const hidden = [...document.querySelectorAll<HTMLElement>(".hx-ch, .hx-lede, .hx-btn, .hx-dots, .hx-cell, .hx-tick")].filter(
        (el) => Number(getComputedStyle(el).opacity) < 0.99,
      );
      const inline = [...document.querySelectorAll<HTMLElement>(".hx-ch")].filter((el) => el.style.transform.includes("110%")).length;
      return { hidden: hidden.length, inline, attr: document.documentElement.getAttribute("data-hero") };
    });
    expect(state.attr).toBeNull();
    expect(state.inline).toBe(0);
    // The frame ticks breathe between 0.55 and 1, so they are allowed to be under 1.
    expect(state.hidden).toBeLessThanOrEqual(4);
  });

  test("the links go where they say", async ({ page }) => {
    await arrive(page);
    await expect(page.getByRole("link", { name: "See my works" })).toHaveAttribute("href", "#projects");
    await expect(page.getByRole("link", { name: "Contact me" })).toHaveAttribute("href", "#contact");
    // The label is written twice for the roll; the copy is hidden from assistive tech.
    await expect(page.locator(".hx-btn-primary [aria-hidden='true']").first()).toHaveText("See my works");
  });

  test("the ledger says things that are true", async ({ page }) => {
    await arrive(page);
    await expect(page.locator(".hx-cell-link [role='img']")).toHaveAttribute("aria-label", /^\d+$/);
    await expect(page.locator(".hx-cell-pos dd")).toContainText("7.2756°S");
    await expect(page.locator(".hx-cell-pos dd")).toContainText("112.7937°E");
    // A live clock: it has left its placeholder.
    await expect(page.locator(".hx-clock")).toContainText(/\d\d:\d\d:\d\d/);
  });

  test("keyboard: the two buttons are reachable and named", async ({ page }) => {
    await arrive(page);
    const names = await page.locator(".hx a[href], .hx button").evaluateAll((els) =>
      els.map((el) => (el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\s+/g, " ")),
    );
    expect(names.every((n) => n.length > 0)).toBe(true);
    await page.getByRole("link", { name: "See my works" }).focus();
    await expect(page.getByRole("link", { name: "See my works" })).toBeFocused();
  });
});

test.describe("hero: it fits in one view", () => {
  for (const [w, h, label] of [
    [1917, 940, "a large laptop"],
    [1366, 650, "a short laptop window"],
    [1280, 600, "the shortest we support"],
  ] as const) {
    test(`headline, lede and both buttons are on screen at ${w}x${h} (${label})`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await arrive(page);
      const box = await page.evaluate(() => {
        const r = (s: string) => document.querySelector(s)!.getBoundingClientRect();
        return { title: r("h1.hx-title"), lede: r(".hx-lede"), cta: r(".hx-actions"), foot: r(".hx-foot"), hero: r(".hx"), innerHeight: window.innerHeight };
      });
      expect(box.title.top).toBeGreaterThanOrEqual(80);
      expect(box.cta.bottom).toBeLessThanOrEqual(box.innerHeight);
      expect(box.foot.bottom).toBeLessThanOrEqual(box.innerHeight + 1);
      expect(box.hero.height).toBeLessThanOrEqual(box.innerHeight + 1);
    });
  }
});

test.describe("hero: on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  test("fits, does not push the page sideways, and the buttons are full-size tap targets", async ({ page }) => {
    await arrive(page);
    const m = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      iw: window.innerWidth,
      heroBottom: document.querySelector(".hx")!.getBoundingClientRect().bottom,
      ih: window.innerHeight,
      buttons: [...document.querySelectorAll(".hx-btn")].map((b) => b.getBoundingClientRect().height),
      cta: document.querySelector(".hx-actions")!.getBoundingClientRect().bottom,
    }));
    expect(m.sw).toBeLessThanOrEqual(m.iw);
    expect(m.heroBottom).toBeLessThanOrEqual(m.ih + 1);
    expect(m.cta).toBeLessThanOrEqual(m.ih);
    for (const h of m.buttons) expect(h).toBeGreaterThanOrEqual(44);
  });

  test("the bottom corners (Lite toggle, chat button) do not cover the ledger", async ({ page }) => {
    await arrive(page);
    const clear = await page.evaluate(() => {
      const ledger = document.querySelector(".hx-ledger")!.getBoundingClientRect();
      const fixed = [...document.querySelectorAll<HTMLElement>("body *")]
        .filter((el) => getComputedStyle(el).position === "fixed" && !el.closest(".hx") && el.getBoundingClientRect().top > window.innerHeight * 0.6)
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.width > 0 && r.height > 0 && r.width < 200);
      return fixed.every((r) => r.top >= ledger.bottom - 1 || r.bottom <= ledger.top + 1 || r.right <= ledger.left || r.left >= ledger.right);
    });
    expect(clear).toBe(true);
  });
});

test.describe("hero: the lens", () => {
  test("appears over the headline, steps aside over a button, and goes when the pointer leaves", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 810 });
    await arrive(page);
    const title = await page.evaluate(() => {
      const r = document.querySelector("h1.hx-title")!.getBoundingClientRect();
      return { l: r.left, t: r.top };
    });
    const lens = page.locator(".hx-lens");
    await expect(lens).toBeAttached();

    await page.mouse.move(title.l + 380, title.t + 150, { steps: 12 });
    await expect(lens).toHaveAttribute("data-on", "");
    // The lit copy is exactly over the real letters: the window and the copy move by equal and opposite amounts.
    const sum = await page.evaluate(() => {
      const parse = (s: string) => (/translate3d\(([-\d.]+)px,\s*([-\d.]+)px/.exec(s) ?? []).slice(1, 3).map(Number);
      const win = parse((document.querySelector(".hx-lens-win") as HTMLElement).style.transform);
      const copy = parse((document.querySelector(".hx-lens-copy") as HTMLElement).style.transform);
      const t = document.querySelector("h1.hx-title")!.getBoundingClientRect();
      const f = document.querySelector(".hx-frame")!.getBoundingClientRect();
      return { dx: win[0] + copy[0] - (t.left - f.left), dy: win[1] + copy[1] - (t.top - f.top) };
    });
    expect(Math.abs(sum.dx)).toBeLessThanOrEqual(1);
    expect(Math.abs(sum.dy)).toBeLessThanOrEqual(1);
    // Letters near the pointer have moved.
    const moved = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("h1.hx-title .hx-ch")].filter((e) => e.style.transform).length);
    expect(moved).toBeGreaterThan(0);

    // Over a button the lens steps aside.
    const btn = await page.locator(".hx-btn-primary").boundingBox();
    await page.mouse.move(btn!.x + btn!.width / 2, btn!.y + btn!.height / 2, { steps: 10 });
    await expect(lens).not.toHaveAttribute("data-on", "");

    // Far from the headline it stays off, and everything it promoted goes to sleep.
    await page.mouse.move(1300, 700, { steps: 8 });
    await expect(lens).not.toHaveAttribute("data-on", "");
  });


  /** The middle of a headline letter, in page coordinates. */
  const centreOf = async (page: Page, letter: RegExp, nth = 0) => {
    const box = await page.locator("h1.hx-title .hx-ch").filter({ hasText: letter }).nth(nth).boundingBox();
    return { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };
  };

  test("over the O the lens finds a wall clock set to the time in Surabaya; over any other letter it does not", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 810 });
    await arrive(page);
    const lens = page.locator(".hx-lens");
    const label = page.locator(".hx-lens-label");

    // On a C: the lens, its coordinates, and no clock.
    const c = await centreOf(page, /^c$/i);
    await page.mouse.move(c.x, c.y, { steps: 14 });
    await expect(lens).toHaveAttribute("data-on", "");
    await expect(lens).not.toHaveAttribute("data-clock", "");
    await expect(label).toHaveText(/^X \d{4}\s+Y \d{4}$/);

    // On the O: the clock wakes, and the readout says the time (and the zone) instead of where the pointer is.
    const o = await centreOf(page, /^o$/i);
    await page.mouse.move(o.x, o.y, { steps: 24 });
    await expect(lens).toHaveAttribute("data-clock", "", { timeout: 5000 });
    await expect(label).toHaveText(/^WIB \d\d:\d\d:\d\d$/);
    await expect(page.locator(".hx-lens .hx-dial")).toHaveCSS("opacity", "1", { timeout: 3000 });

    // The hands are set to the real time there (Surabaya, UTC+7), give or take the moments since.
    const hands = await page.evaluate(() => {
      const dial = document.querySelector<HTMLElement>(".hx-lens .hx-dial")!;
      const num = (name: string) => parseFloat(dial.style.getPropertyValue(name));
      const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", hourCycle: "h23", hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(new Date());
      const read = (t: string) => Number(parts.find((p) => p.type === t)!.value);
      const h = read("hour") % 24;
      const m = read("minute");
      const s = read("second");
      return {
        hour: num("--ck-h"),
        minute: num("--ck-m"),
        second: num("--ck-s"),
        wantHour: ((h % 12) + m / 60 + s / 3600) * 30,
        wantMinute: (m + s / 60) * 6,
      };
    });
    const apart = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));
    expect(apart(hands.hour, hands.wantHour)).toBeLessThanOrEqual(3);
    expect(apart(hands.minute, hands.wantMinute)).toBeLessThanOrEqual(8);
    expect(hands.second).toBeGreaterThanOrEqual(0);
    expect(hands.second).toBeLessThan(60);

    // The second hand really turns (one revolution a minute), and the face has its twelve ticks.
    const sweep = await page.locator(".hx-lens .hx-ck-s").evaluate((el) => {
      const cs = getComputedStyle(el);
      return { name: cs.animationName, duration: cs.animationDuration };
    });
    expect(sweep).toEqual({ name: "hx-ck-sweep", duration: "60s" });
    await expect(page.locator(".hx-lens .hx-ck-tick")).toHaveCount(12);

    // Back to a C: the clock goes, and the readout is the coordinates again.
    await page.mouse.move(c.x, c.y, { steps: 24 });
    await expect(lens).not.toHaveAttribute("data-clock", "", { timeout: 5000 });
    await expect(label).toHaveText(/^X \d{4}\s+Y \d{4}$/);
  });

  test("the clock is in the lit copy only: the page's own headline carries none, and nothing of it is read out", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 810 });
    await arrive(page);
    await expect(page.locator("h1.hx-title .hx-dial")).toHaveCount(0);
    await expect(page.locator(".hx-lens .hx-dial")).toHaveCount(1);
    await expect(page.locator(".hx-lens")).toHaveAttribute("aria-hidden", "true");
    // The accessible headline is still just its words.
    await expect(page.locator("h1.hx-title")).toHaveAttribute("aria-label", "Creative Developer");
  });

  test("with Lite on there is no lens and nothing answers the pointer", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 810 });
    await arrive(page, "on");
    await expect(page.locator(".hx-lens")).toHaveCount(0);
    const title = await page.locator("h1.hx-title").boundingBox();
    await page.mouse.move(title!.x + 300, title!.y + 100, { steps: 8 });
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => document.querySelector(".hx")!.hasAttribute("data-hot"))).toBe(false);
    expect(await page.evaluate(() => document.documentElement.hasAttribute("data-hero"))).toBe(false);
  });
});

test.describe("hero: reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("hydrates cleanly and shows the finished hero at once (no entrance, no waiting)", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.goto("/");
    // A calm visitor is never marked to wait: the finished hero is there from the first paint.
    expect(await page.evaluate(() => document.documentElement.hasAttribute("data-hero"))).toBe(false);
    await expect(page.locator("h1")).toContainText(/creative developer/i);
    const visible = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>(".hx-ch")].every((el) => getComputedStyle(el).transform === "none"));
    expect(visible).toBe(true);
    await page.waitForTimeout(800);
    expect(errors.filter((e) => /hydrat|#418|did not match|didn't match/i.test(e))).toEqual([]);
  });

  test("with the full site asked for, the lens follows exactly and nothing else moves", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 810 });
    await arrive(page, "off");
    const box = await page.locator("h1.hx-title").boundingBox();
    await page.mouse.move(box!.x + 400, box!.y + 140, { steps: 6 });
    await expect(page.locator(".hx-lens")).toHaveAttribute("data-on", "");
    const letters = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("h1.hx-title .hx-ch")].filter((e) => e.style.transform).length);
    expect(letters).toBe(0);
  });

  test("the O's clock still appears at the time, but nothing sweeps, locks on or draws itself", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 810 });
    await arrive(page, "off");
    const box = await page.locator("h1.hx-title .hx-ch").filter({ hasText: /^o$/i }).first().boundingBox();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2, { steps: 8 });
    await expect(page.locator(".hx-lens")).toHaveAttribute("data-clock", "", { timeout: 5000 });
    const motion = await page.evaluate(() => ({
      sweep: getComputedStyle(document.querySelector(".hx-lens .hx-ck-s")!).animationName,
      lock: getComputedStyle(document.querySelector(".hx-lens .hx-dial")!, "::before").animationName,
    }));
    expect(motion).toEqual({ sweep: "none", lock: "none" });
  });
});

test.describe("hero: light theme", () => {
  test("the headline is indigo ink on the paper, not white on white", async ({ page }) => {
    await arrive(page);
    await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
    await page.waitForTimeout(300);
    const color = await page.evaluate(() => getComputedStyle(document.querySelector("h1.hx-title")!).color);
    expect(color).toBe("rgb(27, 29, 51)");
    const btn = await page.evaluate(() => getComputedStyle(document.querySelector(".hx-btn-primary")!).backgroundColor);
    expect(btn).toBe("rgb(27, 29, 51)");
  });
});
