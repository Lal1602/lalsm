import { expect, test, type Page } from "@playwright/test";
import { projects } from "../../data/projects";

/**
 * What I Build: the exploded view. Three plates, one for each discipline; the tools of the open one in a legend,
 * each joined to its drawing by pointing; and, for the tools the public archive shows, a real count from it.
 */

const archive = projects.map((p) => ({ title: p.title, tech: p.tech.split(",").map((t) => t.trim().toLowerCase()) }));
const count = (...names: string[]) => archive.filter((p) => p.tech.some((t) => names.includes(t))).length;

async function arrive(page: Page, atTop = 100) {
  await page.goto("/");
  await page.waitForFunction(() => (document.querySelector<HTMLElement>(".preloader")?.style.display ?? "") === "none", null, { timeout: 40_000 });
  await page.evaluate((top) => {
    const r = document.querySelector(".wb-deck")!.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + r.top - top);
  }, atTop);
  await expect(page.locator(".wb-canvas")).toBeVisible();
  // The page smooth-scrolls to where it was told to go; a pointer parked on a row would be left behind by it.
  await expect
    .poll(async () => {
      const y = await page.evaluate(() => Math.round(window.scrollY));
      await page.waitForTimeout(250);
      return y === (await page.evaluate(() => Math.round(window.scrollY)));
    })
    .toBe(true);
}

const tab = (page: Page, i: number) => page.locator(".wb-bay-btn").nth(i);
const tool = (page: Page, name: string) => page.locator(".wb-tool", { has: page.locator(".wb-tool-name", { hasText: new RegExp(`^${name.replace(".", "\\.")}$`) }) });

test.describe("what I build (the exploded view)", () => {
  test("three plates and three disciplines, one open at a time", async ({ page }) => {
    await arrive(page);
    await expect(page.locator(".wb-bay-btn")).toHaveCount(3);
    await expect(page.locator(".wb-plate")).toHaveCount(3);
    await expect(page.locator('.wb-plate[data-active="true"]')).toHaveCount(1);
    await expect(tab(page, 0)).toHaveAttribute("aria-selected", "true");
    // Every discipline is described on the page without opening anything.
    await expect(page.locator(".wb-bay-name")).toHaveText([/Frontend\s+Engineering/, /Backend\s*&\s*DevOps/, /Mobile\s*&\s*Game Dev/]);
    await expect(page.locator(".wb-bay-brief").first()).toContainText("The part you touch");
    // The open one's tools are in the legend, each with its sentence.
    await expect(page.locator(".wb-tool-name")).toHaveText(["TypeScript", "React", "Next.js", "GSAP", "Three.js", "Tailwind"]);
    await expect(page.locator(".wb-tool-role").first()).toContainText("typed");

    await tab(page, 1).click();
    await expect(tab(page, 1)).toHaveAttribute("aria-selected", "true");
    await expect(tab(page, 0)).toHaveAttribute("aria-selected", "false");
    await expect(page.locator(".wb-tool-name")).toHaveText(["Node.js", "Laravel", "PHP", "MySQL", "PostgreSQL", "Docker"]);
    await expect(page.locator('.wb-plate[data-active="true"]')).toHaveAttribute("data-tone", "violet");

    await tab(page, 2).click();
    await expect(page.locator(".wb-tool-name")).toHaveText(["React Native", "Flutter", "Phaser.js", "Canvas API", "Figma"]);
    await expect(page.locator('.wb-plate[data-active="true"]')).toHaveAttribute("data-tone", "gold");
  });

  test("clicking a plate opens its discipline", async ({ page }) => {
    await arrive(page);
    // The middle of the bottom plate's diamond: a visitor clicks the drawing, not the empty corner of its box.
    // (Once the plates have come out of their stack: they move for a second or so after the section is first seen.)
    await page.waitForTimeout(1800);
    const box = (await page.locator('.wb-plate[data-tone="gold"]').boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.5);
    await expect(tab(page, 2)).toHaveAttribute("aria-selected", "true");
    await expect(page.locator('.wb-plate[data-active="true"]')).toHaveAttribute("data-tone", "gold");
  });

  test("the arrow keys move between disciplines, and Home goes back to the first", async ({ page }) => {
    await arrive(page);
    await tab(page, 0).focus();
    await page.keyboard.press("ArrowDown");
    await expect(tab(page, 1)).toHaveAttribute("aria-selected", "true");
    await expect(tab(page, 1)).toBeFocused();
    await page.keyboard.press("End");
    await expect(tab(page, 2)).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Home");
    await expect(tab(page, 0)).toHaveAttribute("aria-selected", "true");
  });

  test("pointing at a tool lights its drawing, and pointing at a drawing lights its tool", async ({ page }) => {
    await arrive(page);
    await tool(page, "GSAP").hover();
    await expect(page.locator('.wb-plate[data-active="true"] .wb-ft[data-tool="gsap"]')).toHaveAttribute("data-hot", "true");
    await expect(page.locator('.wb-plate[data-active="true"] .wb-ft[data-hot]')).toHaveCount(1);
    await expect(page.locator('.wb-plate[data-active="true"]')).toHaveAttribute("data-lit", "true");

    // And the other way: the mark's own hit area is a real target (try again if the plate was still settling).
    await expect(async () => {
      await page.locator('.wb-plate[data-active="true"] .wb-ft[data-tool="three"] .wb-hit').hover({ force: true });
      await expect(tool(page, "Three.js")).toHaveAttribute("data-hot", "true", { timeout: 1500 });
    }).toPass({ timeout: 12_000 });
    await expect(page.locator('.wb-plate[data-active="true"] .wb-ft[data-tool="three"]')).toHaveAttribute("data-hot", "true");
  });

  test("says in how many archive projects a tool appears, from the archive itself, and names them", async ({ page }) => {
    await arrive(page);
    const total = archive.length;
    const gsap = count("gsap", "scrolltrigger");
    expect(gsap).toBeGreaterThan(0);
    await expect(tool(page, "GSAP").locator(".wb-pips em")).toHaveText(`${gsap}/${total}`);
    await expect(tool(page, "GSAP").locator(".wb-pips i[data-on]")).toHaveCount(gsap);
    await expect(tool(page, "GSAP").locator(".wb-pips i")).toHaveCount(total);
    await expect(tool(page, "Three.js").locator(".wb-pips em")).toHaveText(`${count("three.js", "webgl")}/${total}`);
    await expect(tool(page, "TypeScript").locator(".wb-pips em")).toHaveText(`${count("typescript")}/${total}`);

    // Pointing at it names the projects: real titles, the first few.
    await tool(page, "GSAP").hover();
    const named = archive.filter((p) => p.tech.some((t) => ["gsap", "scrolltrigger"].includes(t))).map((p) => p.title);
    await expect(page.locator(".wb-seen")).toContainText("In the archive:");
    await expect(page.locator(".wb-seen")).toContainText(named[0]!);

    await tab(page, 2).click();
    await expect(tool(page, "Phaser.js").locator(".wb-pips em")).toHaveText(`${count("phaser.js", "phaser js")}/${total}`);
    await expect(tool(page, "Canvas API").locator(".wb-pips em")).toHaveText(`${count("canvas api", "html5 canvas")}/${total}`);
  });

  test("says nothing about a tool the archive does not list", async ({ page }) => {
    await arrive(page);
    await expect(tool(page, "React").locator(".wb-pips")).toHaveCount(0);
    await expect(tool(page, "Next.js").locator(".wb-pips")).toHaveCount(0);
    await tab(page, 1).click();
    for (const name of ["Node.js", "Laravel", "PHP", "MySQL", "PostgreSQL", "Docker"]) await expect(tool(page, name).locator(".wb-pips")).toHaveCount(0);
  });

  test("left alone, it steps through the tools by itself; the pointer takes it over and gives it back", async ({ page }) => {
    await arrive(page);
    // Park the pointer outside the deck: the scan is on and moves from tool to tool.
    await page.mouse.move(5, 5);
    const seen = new Set<string>();
    await expect
      .poll(
        async () => {
          const id = await page.locator(".wb-plate[data-active='true'] .wb-ft[data-hot]").getAttribute("data-tool").catch(() => null);
          if (id) seen.add(id);
          return seen.size;
        },
        { timeout: 12_000, intervals: [300] },
      )
      .toBeGreaterThanOrEqual(2);

    // Pointing at a tool holds that tool, and the scan stays out of the way while the pointer is on the deck.
    await tool(page, "React").hover();
    await page.waitForTimeout(3200);
    await expect(page.locator(".wb-plate[data-active='true'] .wb-ft[data-hot]")).toHaveAttribute("data-tool", "react");
  });

  test("the plates open the stage once, and each stays inside it whichever discipline is open", async ({ page }) => {
    await arrive(page);
    for (let i = 0; i < 3; i++) {
      await tab(page, i).click();
      await page.waitForTimeout(900);
      const inside = await page.evaluate(() => {
        const c = document.querySelector(".wb-canvas")!.getBoundingClientRect();
        return Array.from(document.querySelectorAll(".wb-plate")).map((p) => {
          const r = p.getBoundingClientRect();
          // The parallax moves a plate a few pixels: allow it.
          return r.top >= c.top - 6 && r.bottom <= c.bottom + 6 && r.left >= c.left - 14 && r.right <= c.right + 14;
        });
      });
      expect(inside, `with discipline ${i} open`).toEqual([true, true, true]);
    }
  });

  test("the deck does not change height when another discipline opens", async ({ page }) => {
    await arrive(page);
    const heights: number[] = [];
    for (let i = 0; i < 3; i++) {
      await tab(page, i).click();
      await page.waitForTimeout(500);
      heights.push(Math.round((await page.locator(".wb-deck").boundingBox())!.height));
    }
    expect(Math.max(...heights) - Math.min(...heights), `deck heights ${heights.join(", ")}`).toBeLessThanOrEqual(2);
  });

  test("the plates hold no text: the names are in the page, not drawn", async ({ page }) => {
    await arrive(page);
    expect(await page.locator(".wb-canvas text").count()).toBe(0);
    expect((await page.locator(".wb-canvas").innerText()).trim()).toBe("");
    // The legend is real text, readable by assistive technology, and the view says what it is.
    await expect(page.locator(".wb-canvas")).toHaveAttribute("role", "img");
    await expect(page.locator(".wb-legend")).toHaveAttribute("role", "tabpanel");
  });

  test("with reduced motion everything is there at once, nothing moves by itself, and it still answers", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 810 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await arrive(page);
    await expect(page.locator(".wb-canvas")).not.toHaveAttribute("data-run", /.*/);
    await page.mouse.move(5, 5);
    await page.waitForTimeout(3500);
    await expect(page.locator(".wb-ft[data-hot]")).toHaveCount(0);
    await tab(page, 1).click();
    await expect(page.locator('.wb-plate[data-active="true"]')).toHaveAttribute("data-tone", "violet");
    await tool(page, "Docker").hover();
    await expect(page.locator('.wb-plate[data-active="true"] .wb-ft[data-tool="docker"]')).toHaveAttribute("data-hot", "true");
    await context.close();
  });

  test("with Lite on, the same: no motion of its own, and every control works", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("lite-mode", "on"));
    await arrive(page);
    await expect(page.locator(".wb-canvas")).not.toHaveAttribute("data-run", /.*/);
    await tab(page, 2).click();
    await expect(page.locator(".wb-tool-name")).toHaveText(["React Native", "Flutter", "Phaser.js", "Canvas API", "Figma"]);
  });

  test("on a phone the view comes first, then the tabs, then the legend, and nothing overflows sideways", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForFunction(() => (document.querySelector<HTMLElement>(".preloader")?.style.display ?? "") === "none", null, { timeout: 40_000 });
    await page.evaluate(() => {
      const r = document.querySelector(".wb-deck")!.getBoundingClientRect();
      window.scrollTo(0, window.scrollY + r.top - 60);
    });
    await expect(page.locator(".wb-canvas")).toBeVisible();
    const tops = await page.evaluate(() => [".wb-stage", ".wb-index", ".wb-legend"].map((s) => Math.round(document.querySelector(s)!.getBoundingClientRect().top + scrollY)));
    expect(tops[0]!).toBeLessThan(tops[1]!);
    expect(tops[1]!).toBeLessThan(tops[2]!);

    // Only the open discipline spells itself out; a tap opens another.
    await expect(page.locator(".wb-item[data-active] .wb-bay-brief")).toBeVisible();
    await expect(page.locator(".wb-item:not([data-active]) .wb-bay-brief").first()).toBeHidden();
    await tab(page, 1).tap();
    await expect(tab(page, 1)).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".wb-tool-name").first()).toHaveText("Node.js");
    // A tap on a tool holds it lit (there is no hover on a touch screen).
    await tool(page, "Docker").tap();
    await expect(page.locator('.wb-plate[data-active="true"] .wb-ft[data-tool="docker"]')).toHaveAttribute("data-hot", "true");

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await context.close();
  });

  test("light theme: the plates are paper, the ink is the ink, and the type reads", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("theme-storage", JSON.stringify({ state: { theme: { type: "light", color: "#e4ddcc" } }, version: 0 })));
    await arrive(page);
    const m = await page.evaluate(() => {
      const fill = getComputedStyle(document.querySelector(".wb-face")!).fill;
      const name = getComputedStyle(document.querySelector(".wb-tool-name")!).color;
      const role = getComputedStyle(document.querySelector(".wb-tool-role")!).color;
      return { fill, name, role };
    });
    const rgb = (s: string) => (s.match(/\d+/g) ?? []).slice(0, 3).map(Number);
    const lum = ([r, g, b]: number[]) => {
      const lin = (c: number) => ((c / 255) <= 0.04045 ? c / 255 / 12.92 : (((c / 255) + 0.055) / 1.055) ** 2.4);
      return 0.2126 * lin(r!) + 0.7152 * lin(g!) + 0.0722 * lin(b!);
    };
    const contrast = (a: number[], b: number[]) => {
      const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
      return (hi! + 0.05) / (lo! + 0.05);
    };
    const paper = rgb(m.fill);
    // Paper: light, but never white.
    expect(lum(paper)).toBeGreaterThan(0.6);
    expect(lum(paper)).toBeLessThan(0.84);
    expect(contrast(rgb(m.name), paper)).toBeGreaterThan(7);
    expect(contrast(rgb(m.role), paper)).toBeGreaterThanOrEqual(4.5);
  });
});
