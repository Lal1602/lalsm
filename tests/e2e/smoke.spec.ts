import { expect, test } from "@playwright/test";

test.describe("pages", () => {
  test("home page renders with metadata and a working skip link", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/BILAL/);
    await expect(page.locator("h1").first()).toContainText(/creative developer/i, { timeout: 15_000 });

    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description?.length).toBeGreaterThan(50);
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('script[type="application/ld+json"]').first()).toBeAttached();
    await expect(page.locator("a.skip-link")).toHaveAttribute("href", "#content");
  });

  test("viewport allows pinch zoom", async ({ page }) => {
    await page.goto("/");
    const viewport = await page.locator('meta[name="viewport"]').getAttribute("content");
    expect(viewport).not.toMatch(/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\.0)?(,|$)/);
  });

  test("blog lists posts and a post renders", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByRole("heading", { level: 1, name: "Blog" })).toBeVisible();
    const first = page.locator("a.blog-card").first();
    await expect(first).toBeVisible();

    await first.click();
    await expect(page.locator("article.blog-prose h2").first()).toBeVisible();
  });

  test("project case study renders and links to the next project", async ({ page }) => {
    await page.goto("/projects/mindpoint");
    await expect(page.getByRole("heading", { level: 1, name: "MindPoint" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Launch live demo/ })).toHaveAttribute("href", /^https:\/\//);
    await page.getByRole("link", { name: /Next/ }).click();
    await expect(page).toHaveURL(/\/projects\/(?!mindpoint)/);
  });

  test("unknown project and post slugs 404", async ({ request }) => {
    expect((await request.get("/projects/nope")).status()).toBe(404);
    expect((await request.get("/blog/nope")).status()).toBe(404);
  });

  test("cv page offers the PDF", async ({ page }) => {
    await page.goto("/cv");
    await expect(page.getByRole("link", { name: /Download PDF/ })).toHaveAttribute("href", "/cv.pdf");
  });
});

test.describe("machine-readable routes", () => {
  test("cv.pdf is a real PDF", async ({ request }) => {
    const response = await request.get("/cv.pdf");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/pdf");
    const body = await response.body();
    expect(body.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  });

  test("sitemap and robots exist and agree", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/projects/mindpoint");
    expect(sitemap).toContain("/blog/");
    expect(sitemap).toContain("/cv");

    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toMatch(/Sitemap: .*\/sitemap\.xml/);
    expect(robots).toMatch(/Disallow: \/api\//);
  });

  test("favicon and self-hosted vendor script are served", async ({ request }) => {
    expect((await request.get("/b-logo.jpg")).status()).toBe(200);
    const vendor = await request.get("/vendor/tubes1.min.js");
    expect(vendor.status()).toBe(200);
    expect(vendor.headers()["cache-control"]).toContain("immutable");
  });

  test("open graph image is generated", async ({ request }) => {
    const response = await request.get("/opengraph-image");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
  });
});

test.describe("chat API", () => {
  const post = (request: import("@playwright/test").APIRequestContext, data: unknown, headers = {}) =>
    request.post("/api/ai/chat", { data, headers });

  test("rejects bad input with 400, not a made-up answer", async ({ request }) => {
    expect((await post(request, {})).status()).toBe(400);
    expect((await post(request, { message: "   " })).status()).toBe(400);
    expect((await post(request, { message: "a".repeat(501) })).status()).toBe(400);
    expect((await post(request, { message: "hi", history: "nope" })).status()).toBe(400);

    const invalidJson = await request.post("/api/ai/chat", {
      data: "{not json",
      headers: { "content-type": "application/json" },
    });
    expect(invalidJson.status()).toBe(400);
  });

  test("refuses cross-origin browser posts", async ({ request }) => {
    const response = await post(request, { message: "halo" }, { origin: "https://evil.example" });
    expect(response.status()).toBe(403);
  });

  test("answers from the local simulation when no API key is set, then rate-limits", async ({ request }) => {
    // Unique client address so other tests' requests do not count against this one.
    const headers = { "x-forwarded-for": "203.0.113.77" };

    const ok = await post(request, { message: "tunjukkan proyek MindPoint" }, headers);
    expect(ok.status()).toBe(200);
    const body = await ok.json();
    expect(body.reply).toContain("[ACTION:OPEN_PROJECT:MindPoint]");
    expect(body.suggestions).toHaveLength(3);

    let limited = 0;
    for (let i = 0; i < 10; i++) {
      const response = await post(request, { message: "halo" }, headers);
      if (response.status() === 429) {
        limited += 1;
        expect(Number(response.headers()["retry-after"])).toBeGreaterThan(0);
      }
    }
    expect(limited).toBeGreaterThan(0);
  });
});

test.describe("nebula seams", () => {
  async function scrollToWorkflowEnd(page: import("@playwright/test").Page) {
    await page.goto("/");
    await page.waitForFunction(
      () => (document.querySelector<HTMLElement>(".preloader")?.style.display ?? "") === "none",
      null,
      { timeout: 30_000 },
    );
    await page.evaluate(() => {
      const r = document.getElementById("workflow")!.getBoundingClientRect();
      window.scrollTo(0, window.scrollY + r.bottom - window.innerHeight / 2);
    });
  }

  test("both halves of the HIW seam draw from the shared renderer", async ({ page }) => {
    await scrollToWorkflowEnd(page);
    const upper = page.locator(".cosmic-nebula-seam-upper");
    const lower = page.locator(".cosmic-nebula-seam-lower");
    await expect(upper).toHaveAttribute("data-ready", "true", { timeout: 10_000 });
    await expect(lower).toHaveAttribute("data-ready", "true", { timeout: 10_000 });

    // The canvases actually hold pixels: at least some of the cloud is opaque.
    const opaque = await page.evaluate(async () => {
      const canvas = document.querySelector<HTMLCanvasElement>(".cosmic-nebula-seam-lower canvas")!;
      const bmp = await createImageBitmap(canvas);
      const c = document.createElement("canvas");
      c.width = bmp.width;
      c.height = bmp.height;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(bmp, 0, 0);
      const data = ctx.getImageData(0, 0, c.width, Math.min(c.height, 40)).data;
      let n = 0;
      for (let i = 3; i < data.length; i += 4) if (data[i] > 40) n++;
      return n;
    });
    expect(opaque).toBeGreaterThan(200);
  });

  test("Lite mode still paints the nebula, as a still frame", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("lite-mode", "on"));
    await scrollToWorkflowEnd(page);
    await expect(page.locator("html")).toHaveAttribute("data-lite", "1");
    await expect(page.locator(".cosmic-nebula-seam-lower")).toHaveAttribute("data-ready", "true", { timeout: 10_000 });
  });
});

test.describe("project plates", () => {
  async function arriveAtPlates(page: import("@playwright/test").Page) {
    await page.goto("/");
    await page.waitForFunction(
      () => (document.querySelector<HTMLElement>(".preloader")?.style.display ?? "") === "none",
      null,
      { timeout: 40_000 },
    );
    await page.evaluate(() => {
      const r = document.querySelector(".plate-stage")!.getBoundingClientRect();
      window.scrollTo(0, window.scrollY + r.top - 160);
    });
    // The arrival animation has played and the section has revealed itself.
    await expect(page.locator(".plate-gallery")).toHaveAttribute("data-revealed", "true", { timeout: 10_000 });
  }

  test("one canvas, sized to its stage, and the whole archive is readable as text", async ({ page }) => {
    await arriveAtPlates(page);
    const stage = await page.evaluate(() => {
      const c = document.querySelector<HTMLCanvasElement>(".plate-canvas")!;
      return { w: c.clientWidth, h: c.clientHeight, pw: c.width, ph: c.height, canvases: document.querySelectorAll(".plate-canvas").length };
    });
    expect(stage.canvases).toBe(1);
    expect(stage.w).toBeGreaterThan(300);
    expect(stage.pw).toBeGreaterThanOrEqual(stage.w); // never drawn below css resolution
    // Titles are real DOM, for screen readers and search engines.
    await expect(page.locator(".plate-title")).toHaveText("Herbal Mart");
    expect(await page.locator("nav[aria-label='All projects'] a").count()).toBeGreaterThanOrEqual(18);
  });

  test("arrow keys move the rail, wrapping round, and Enter opens the record", async ({ page }) => {
    await arriveAtPlates(page);
    await page.focus(".plate-stage");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator(".plate-title")).toHaveText("Bunny Jump Lite");
    await expect(page.locator(".plate-ticks button[aria-current='true']")).toHaveAttribute("aria-label", /^02 /);
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    // From the first plate, left goes to the last: the rail is a loop.
    await expect(page.locator(".plate-eyebrow")).toContainText("PLATE 18");
    await page.keyboard.press("Home");
    await expect(page.locator(".plate-title")).toHaveText("Herbal Mart");
    await page.keyboard.press("Enter");
    await expect(page.locator(".project-detail-modal .modal-title")).toHaveText("Herbal Mart");
  });

  test("dragging the plates moves them, and clicking the centre plate opens it", async ({ page }) => {
    await arriveAtPlates(page);
    const box = (await page.locator(".plate-canvas").boundingBox())!;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;

    // Drag left by about one plate pitch: the next plate comes to the centre.
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx - 150, cy, { steps: 6 });
    await page.mouse.move(cx - 300, cy, { steps: 6 });
    await page.mouse.move(cx - 520, cy, { steps: 6 });
    await page.mouse.up();
    await expect(page.locator(".plate-title")).not.toHaveText("Herbal Mart", { timeout: 5_000 });
    const after = (await page.locator(".plate-title").textContent()) ?? "";

    // A plain click on the centre plate opens that project's record.
    await page.waitForTimeout(1200); // settle
    await page.mouse.click(cx, cy);
    await expect(page.locator(".project-detail-modal .modal-title")).toHaveText(after);
  });

  test("with reduced motion the plates are simply there and move without animating", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    // Reduced motion switches Lite on by itself; ask for the full site so the gallery is there.
    await page.addInitScript(() => localStorage.setItem("lite-mode", "off"));
    await arriveAtPlates(page);
    await page.focus(".plate-stage");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator(".plate-title")).toHaveText("Bunny Jump Lite");
    // No animation frames are being spent on an idle gallery: the canvas holds still.
    const same = await page.evaluate(async () => {
      const c = document.querySelector<HTMLCanvasElement>(".plate-canvas")!;
      const a = c.toDataURL();
      await new Promise((r) => setTimeout(r, 400));
      return a === c.toDataURL();
    });
    expect(same).toBe(true);
    await context.close();
  });

  test("Lite mode shows the plain grid and loads no canvas", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("lite-mode", "on"));
    await page.goto("/");
    await page.waitForFunction(
      () => (document.querySelector<HTMLElement>(".preloader")?.style.display ?? "") === "none",
      null,
      { timeout: 40_000 },
    );
    await expect(page.locator(".lite-projects")).toBeAttached();
    expect(await page.locator(".lite-projects li").count()).toBeGreaterThanOrEqual(18);
    expect(await page.locator(".plate-canvas").count()).toBe(0);
  });
});

test.describe("flight deck (How I Work)", () => {
  type P = import("@playwright/test").Page;

  async function arrive(page: P, atTop = 160, waitReady = true) {
    await page.goto("/");
    await page.waitForFunction(
      () => (document.querySelector<HTMLElement>(".preloader")?.style.display ?? "") === "none",
      null,
      { timeout: 40_000 },
    );
    await page.evaluate((top) => {
      const r = document.querySelector(".fd")!.getBoundingClientRect();
      window.scrollTo(0, window.scrollY + r.top - top);
    }, atTop);
    await expect(page.locator(".fd-bays")).toBeAttached();
    // The entrance has finished and the deck is ready for hover and focus states.
    if (waitReady) await expect(page.locator(".fd")).toHaveAttribute("data-ready", "true", { timeout: 15_000 });
  }

  const live = (page: P) => page.locator(".fd-live");

  test("lists the four stages, each with a way to engage it", async ({ page }) => {
    await arrive(page);
    await expect(page.locator(".fd-bay")).toHaveCount(4);
    await expect(page.locator(".fd-name")).toHaveText(["Discover", "Design", "Build", "Launch"].map((s) => new RegExp(`^${s}$`, "i")));
    await expect(page.locator(".fd-engage")).toHaveCount(4);
    await expect(page.locator(".fd-st")).toHaveCount(4);
    // What each stage gives you is on the page without any interaction.
    await expect(page.locator(".fd-out").nth(2)).toContainText("Staging site");
  });

  test("scrolling the section flies the ship; acting on the deck takes the controls", async ({ page }) => {
    await arrive(page, 700, false); // deck low on the screen: early in the flight
    await expect(live(page)).toContainText("Stage 01");
    await page.evaluate(() => {
      const r = document.querySelector(".fd")!.getBoundingClientRect();
      window.scrollTo(0, window.scrollY + r.bottom - window.innerHeight * 0.5); // bays in view: the flight is over
    });
    await expect(live(page)).toContainText("Stage 04", { timeout: 8_000 });
    await expect(page.locator(".fd")).toHaveAttribute("data-mode", "auto");

    // Hovering a bay sends the ship there and holds it, whatever the page does next.
    await page.locator(".fd-bay").nth(1).hover();
    await expect(live(page)).toContainText("Stage 02");
    await expect(page.locator(".fd")).toHaveAttribute("data-mode", "manual");
    await page.mouse.wheel(0, 80);
    await expect(live(page)).toContainText("Stage 02");

    // Autopilot hands it back to the page.
    await page.locator(".fd-auto").click();
    await expect(page.locator(".fd")).toHaveAttribute("data-mode", "auto");
  });

  test("a station press flies the ship there, and arrow keys move between stations", async ({ page }) => {
    await arrive(page);
    await page.locator(".fd-st").nth(2).click();
    await expect(live(page)).toContainText("Stage 03");
    await expect(page.locator(".fd-st[data-active]")).toHaveAttribute("data-i", "2");
    await page.locator(".fd-st").nth(2).focus();
    await page.keyboard.press("ArrowRight");
    await expect(live(page)).toContainText("Stage 04");
    await page.keyboard.press("Home");
    await expect(live(page)).toContainText("Stage 01");
    await expect(page.locator(".fd-st").nth(0)).toBeFocused();
  });

  test("holding the button engages the stage; letting go early does not", async ({ page }) => {
    await arrive(page);
    const button = page.locator(".fd-engage").nth(2);
    await button.focus();

    // Released early: nothing is committed. The hold is timed inside the page, from the
    // key events themselves: on a busy machine the gap between two automation commands can be
    // longer than the hold, and then the press was not early and the assertion would be wrong.
    await page.evaluate(() => {
      const w = window as unknown as { __held?: { down?: number; up?: number } };
      w.__held = {};
      document.addEventListener("keydown", () => (w.__held!.down ??= performance.now()), { once: true, capture: true });
      document.addEventListener("keyup", () => (w.__held!.up = performance.now()), { once: true, capture: true });
    });
    await page.keyboard.down("Space");
    await page.keyboard.up("Space");
    await page.waitForTimeout(450);
    const held = await page.evaluate(() => {
      const h = (window as unknown as { __held: { down: number; up: number } }).__held;
      return h.up - h.down;
    });
    expect(held).toBeLessThan(700); // it was a tap, not a hold
    await expect(button).toHaveAttribute("aria-pressed", "false");

    // Held the whole way: engaged, the ship is at its station, its checkbox is filled.
    await page.keyboard.down("Space");
    await expect(button).toHaveAttribute("aria-pressed", "true", { timeout: 4_000 });
    await page.keyboard.up("Space");
    await expect(page.locator(".fd-bay").nth(2)).toHaveAttribute("data-engaged", "true");
    await expect(live(page)).toContainText("Stage 03");
    await expect(live(page)).toContainText("Engaged");
  });

  test("with Lite on, one press engages: no hold, no sparks", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("lite-mode", "on"));
    await arrive(page);
    const button = page.locator(".fd-engage").nth(1);
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".fd-spark")).toHaveCount(0);
  });

  test("on a phone the bays are a rail that flies the ship, with no sideways overflow", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    await arrive(page, 40);
    await expect(page.locator(".fd")).toHaveAttribute("data-rail", "true");
    await expect(live(page)).toContainText("Stage 01");
    await page.evaluate(() => {
      const rail = document.querySelector<HTMLElement>(".fd-bays")!;
      rail.scrollTo({ left: (rail.children[2] as HTMLElement).offsetLeft - 20, behavior: "instant" });
    });
    await expect(live(page)).toContainText("Stage 03", { timeout: 5_000 });
    await expect(page.locator(".fd-count")).toContainText("03");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await context.close();
  });
});
