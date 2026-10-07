import { expect, test, type Page, type Route } from "@playwright/test";

/**
 * B.I.L.A.L., the assistant. The test server has no model key, so the assistant answers from its offline rules:
 * what these tests rely on is the interface (the panel, the commands, the cards, the safety of what it renders),
 * and the requests it makes. Replies that need to be long, or hostile, are supplied by intercepting the request.
 */

async function arrive(page: Page, opts: { lite?: "on" | "off" } = {}) {
  await page.addInitScript((lite) => localStorage.setItem("lite-mode", lite), opts.lite ?? "off");
  await page.goto("/");
  await page.waitForFunction(
    () => (document.querySelector<HTMLElement>(".preloader")?.style.display ?? "") === "none" && !document.documentElement.hasAttribute("data-hero"),
    null,
    { timeout: 60_000 },
  );
}

const panel = (page: Page) => page.locator(".ai-panel");
const launcher = (page: Page) => page.locator(".ai-chat-toggle-btn");
const box = (page: Page) => page.locator(".ai-composer textarea");

async function open(page: Page) {
  await launcher(page).click();
  await expect(panel(page)).toHaveAttribute("data-open", "");
}

/** The question has been asked and its answer has fully arrived (the Stop button has come and gone). */
async function answered(page: Page) {
  await expect(panel(page).locator(".ai-user-bubble").last()).toBeVisible();
  await expect(panel(page).locator(".ai-stop")).toHaveCount(0, { timeout: 20_000 });
  await expect(panel(page).locator(".ai-msg-bot .ai-bot-body").last()).not.toBeEmpty();
}

/** Answers the next chat request with this JSON (the shape the offline route uses). */
async function reply(page: Page, body: { reply: string; suggestions?: string[] }) {
  await page.route("**/api/ai/chat", (route: Route) => {
    if (route.request().method() !== "POST") return route.fallback();
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ suggestions: [], ...body }) });
  });
}

test.describe("assistant: the panel", () => {
  test("opens from the launcher, shows the first screen, says it is offline, and closes with Escape", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await arrive(page);
    await expect(panel(page)).not.toHaveAttribute("data-open", "");
    await expect(panel(page)).toHaveAttribute("aria-hidden", "true");

    await open(page);
    await expect(panel(page).locator(".ai-welcome-title")).toContainText("B.I.L.A.L.");
    await expect(panel(page).locator(".ai-quick-tile")).toHaveCount(6);
    // The status is what the server says about a live model, not a claim: this server has none.
    await expect(panel(page).locator(".ai-status")).toContainText(/offline/i, { timeout: 10_000 });
    await expect(panel(page).locator(".ai-ctx-here")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(panel(page)).not.toHaveAttribute("data-open", "");
    await expect(launcher(page)).toBeFocused();
  });

  test("Ctrl+K opens and closes it from anywhere, and the page is not pushed aside", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await arrive(page);
    const before = await page.evaluate(() => document.getElementById("main-content-wrapper")!.getBoundingClientRect().width);
    await page.keyboard.press("Control+k");
    await expect(panel(page)).toHaveAttribute("data-open", "");
    await expect(box(page)).toBeFocused({ timeout: 3000 });
    const during = await page.evaluate(() => document.getElementById("main-content-wrapper")!.getBoundingClientRect().width);
    expect(during).toBe(before);
    await page.keyboard.press("Control+k");
    await expect(panel(page)).not.toHaveAttribute("data-open", "");
  });

  test("knows which section the visitor is in, offers questions for it, and sends it with the question", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await arrive(page);
    await open(page);
    await expect(panel(page).locator(".ai-ctx-here")).toContainText(/Home/i);

    await page.evaluate(() => document.getElementById("projects")!.scrollIntoView({ block: "center" }));
    await expect(panel(page).locator(".ai-ctx-here")).toContainText(/Projects/i, { timeout: 8000 });
    await expect(panel(page).locator(".ai-welcome .ai-chip").first()).toContainText(/complex|rumit|best project/i);

    const sent = page.waitForRequest((r) => r.url().includes("/api/ai/chat") && r.method() === "POST");
    await box(page).fill("halo");
    await box(page).press("Enter");
    const body = (await sent).postDataJSON();
    expect(body).toMatchObject({ message: "halo", section: "projects" });
    expect(body.lang).toMatch(/^(en|id)$/);
  });
});

test.describe("assistant: a conversation", () => {
  test("a question gets an answer that arrives gradually, with a card for what it pointed at and chips for what next", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await arrive(page);
    await open(page);
    await box(page).fill("tunjukkan proyek MindPoint");
    await box(page).press("Enter");

    await expect(panel(page).locator(".ai-user-bubble")).toHaveText("tunjukkan proyek MindPoint");
    const bot = panel(page).locator(".ai-msg-bot").last();
    await expect(bot.locator(".ai-bot-body")).toContainText("MindPoint", { timeout: 10_000 });
    await expect(bot).not.toContainText("[ACTION");
    await expect(bot.locator(".ai-card")).toHaveCount(1);
    await expect(bot.locator(".ai-card")).toContainText("MindPoint");
    await expect(bot.locator(".ai-tag")).toContainText(/offline/i);
    await expect(panel(page).locator(".ai-chip")).toHaveCount(3, { timeout: 10_000 });
    // The tools appear once it is done: copy, read aloud (if the browser can), answer again.
    await expect(bot.locator(".ai-tools button").first()).toBeVisible();
  });

  test("Stop ends an answer that is arriving and keeps what had arrived", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await arrive(page);
    await reply(page, { reply: Array.from({ length: 400 }, (_, i) => `kata${i}`).join(" ") });
    await open(page);
    await box(page).fill("ceritakan panjang");
    await box(page).press("Enter");
    const stop = panel(page).locator(".ai-stop");
    await expect(stop).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(400);
    await stop.click();
    const bot = panel(page).locator(".ai-msg-bot").last();
    await expect(bot.locator(".ai-tag", { hasText: /stopped|dihentikan/i })).toBeVisible();
    const kept = await bot.locator(".ai-bot-body").innerText();
    expect(kept.length).toBeGreaterThan(5);
    expect(kept).not.toContain("kata399");
    await expect(panel(page).locator(".ai-send")).toBeVisible();
    await expect(panel(page).locator(".ai-stop")).toHaveCount(0);
  });

  test("renders markdown as elements, and nothing a reply says can inject markup or a script link", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await arrive(page);
    await reply(page, {
      reply:
        "Ini **tebal** dan `kode`.\n\n- satu\n- dua\n\n```ts\nconst x = 1;\n```\n\n<img src=x onerror=\"window.__pwned=1\"> [klik](javascript:window.__pwned=1) [cv](/cv)",
    });
    await open(page);
    await box(page).fill("uji");
    await box(page).press("Enter");
    const body = panel(page).locator(".ai-msg-bot").last().locator(".ai-bot-body");
    await expect(body.locator("strong")).toHaveText("tebal", { timeout: 10_000 });
    await expect(body.locator("li")).toHaveCount(2);
    await expect(body.locator(".ai-code")).toContainText("const x = 1;");
    await expect(body.locator("img")).toHaveCount(0);
    expect(await body.locator("a").evaluateAll((as) => as.map((a) => a.getAttribute("href")))).toEqual(["/cv"]);
    expect(await page.evaluate(() => (window as unknown as { __pwned?: number }).__pwned)).toBeUndefined();
    // The markup the reply wrote is shown as the text it is.
    await expect(body).toContainText("<img src=x");
  });

  test("keeps the conversation across a reload", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await arrive(page);
    await open(page);
    await box(page).fill("halo");
    await box(page).press("Enter");
    await answered(page);
    await page.waitForTimeout(500);
    await page.reload();
    await page.waitForFunction(() => (document.querySelector<HTMLElement>(".preloader")?.style.display ?? "") === "none", null, { timeout: 60_000 });
    await open(page);
    await expect(panel(page).locator(".ai-user-bubble")).toHaveText("halo");
    await expect(panel(page).locator(".ai-welcome")).toHaveCount(0);
  });
});

test.describe("assistant: commands", () => {
  test("typing / lists the commands, filters as you type, and Enter runs the one chosen", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await arrive(page);
    await open(page);
    await box(page).fill("/");
    const options = panel(page).locator(".ai-palette [role=option]");
    await expect(options).toHaveCount(11);
    await box(page).fill("/proj");
    await expect(options).toHaveCount(1);
    await expect(options.first()).toContainText("/projects");
    await box(page).press("Enter");
    // It ran: the line is in the conversation as a message, and the reply has the projects' cards.
    await expect(panel(page).locator(".ai-user-bubble").last()).toHaveText("/projects");
    await expect(panel(page).locator(".ai-msg-bot").last().locator(".ai-card")).toHaveCount(3);
    await expect(box(page)).toHaveValue("");
  });

  test("/skills answers with a list made of the CV's own skill groups; /help lists every command", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await arrive(page);
    await open(page);
    await box(page).fill("/skills");
    await box(page).press("Enter");
    await expect(panel(page).locator(".ai-msg-bot").last().locator("li")).toHaveCount(6);
    await box(page).fill("/help");
    await box(page).press("Enter");
    await expect(panel(page).locator(".ai-msg-bot").last().locator("li")).toHaveCount(11);
  });

  test("/cv opens the same CV chooser as the other handles", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await arrive(page);
    await open(page);
    await box(page).fill("/cv");
    await box(page).press("Enter");
    await expect(page.locator(".cvd-dialog")).toBeVisible();
    await expect(page.locator("a.cvd-card")).toHaveCount(2);
    await page.keyboard.press("Escape");
    await expect(page.locator(".cvd-dialog")).toHaveCount(0);
  });

  test("/tone changes the tone, the panel shows it, and the next question carries it", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await arrive(page);
    await open(page);
    await box(page).fill("/tone bro");
    await box(page).press("Enter");
    await expect(panel(page)).toHaveAttribute("data-tone", "bro");
    await expect(panel(page).locator(".ai-ctx-tone")).toBeVisible();
    const sent = page.waitForRequest((r) => r.url().includes("/api/ai/chat") && r.method() === "POST");
    await box(page).fill("halo");
    await box(page).press("Enter");
    expect((await sent).postDataJSON()).toMatchObject({ tone: "bro" });
  });

  test("/theme switches the theme, and /export saves the conversation as a markdown file", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await arrive(page);
    await open(page);
    const before = await page.locator("html").getAttribute("data-theme");
    await box(page).fill("/theme");
    await box(page).press("Enter");
    await expect(page.locator("html")).not.toHaveAttribute("data-theme", before!);
    await expect(page.locator("html")).not.toHaveAttribute("data-theme-switching", "", { timeout: 4000 });

    await box(page).fill("halo");
    await box(page).press("Enter");
    await answered(page);
    const [download] = await Promise.all([page.waitForEvent("download"), (async () => {
      await box(page).fill("/export");
      await box(page).press("Enter");
    })()]);
    expect(download.suggestedFilename()).toMatch(/^bilal-chat-\d{4}-\d{2}-\d{2}\.md$/);
  });

  test("/tour walks the page: each stop moves to its section, with Next until the last, which offers the CV", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await arrive(page);
    await open(page);
    await box(page).fill("/tour");
    await box(page).press("Enter");
    await expect(panel(page).locator(".ai-ctx-tour")).toContainText("1/5");
    await expect(panel(page).locator(".ai-msg-bot").last()).toContainText("What I Build");
    await expect(panel(page).locator(".ai-ctx-here")).toContainText(/What I Build/i, { timeout: 10_000 });
    for (let stop = 2; stop <= 5; stop++) {
      await panel(page).locator(".ai-chip", { hasText: /next stop|berikut/i }).click();
      await expect(panel(page).locator(".ai-ctx-tour")).toContainText(`${stop}/5`);
    }
    await expect(panel(page).locator(".ai-chip", { hasText: /CV/i })).toBeVisible();
    await panel(page).locator(".ai-chip", { hasText: /end the tour|selesai/i }).click();
    await expect(panel(page).locator(".ai-ctx-tour")).toHaveCount(0);
  });
});

test.describe("assistant: the menu and the language", () => {
  test("the menu offers tone, language, export, send to Bilal and reset; Bahasa changes the interface", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await arrive(page);
    await open(page);
    await panel(page).locator(".ai-menu-btn").click();
    await expect(panel(page).locator(".ai-menu")).toBeVisible();
    await panel(page).getByRole("menuitemradio", { name: "Bahasa" }).click();
    await expect(box(page)).toHaveAttribute("placeholder", /Tanya soal Bilal/);
    await panel(page).getByRole("menuitemradio", { name: "English" }).click();
    await expect(box(page)).toHaveAttribute("placeholder", /Ask about Bilal/);
    for (const name of [/export/i, /send to bilal/i, /email a summary/i, /start over/i]) {
      await expect(panel(page).getByRole("menuitem", { name })).toBeVisible();
    }
    await page.keyboard.press("Escape");
    await expect(panel(page).locator(".ai-menu")).toHaveCount(0);
    await expect(panel(page)).toHaveAttribute("data-open", ""); // Escape closed the menu first
  });

  test("'send to Bilal' puts the conversation in the contact form and takes the visitor there", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await arrive(page);
    await open(page);
    await box(page).fill("halo bilal");
    await box(page).press("Enter");
    await answered(page);
    await panel(page).locator(".ai-menu-btn").click();
    await panel(page).getByRole("menuitem", { name: /send to bilal/i }).click();
    await expect(page.locator("#contact-message")).toHaveValue(/halo bilal/, { timeout: 5000 });
  });

  test("start over clears the conversation back to the first screen", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await arrive(page);
    await open(page);
    await box(page).fill("halo");
    await box(page).press("Enter");
    await answered(page);
    await panel(page).locator(".ai-menu-btn").click();
    await panel(page).getByRole("menuitem", { name: /start over/i }).click();
    await expect(panel(page).locator(".ai-welcome")).toBeVisible();
    await expect(panel(page).locator(".ai-msg")).toHaveCount(0);
  });
});

test.describe("assistant: phones, calm and Lite", () => {
  test("on a phone the panel is the whole screen, the composer is in view, and nothing pushes the page sideways", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await arrive(page);
    await open(page);
    // It slides up from the bottom of the screen; measure it once it has arrived.
    await expect.poll(() => panel(page).evaluate((el) => Math.round(el.getBoundingClientRect().top)), { timeout: 5000 }).toBe(0);
    const rect = await panel(page).evaluate((el) => el.getBoundingClientRect().toJSON());
    expect(rect).toMatchObject({ left: 0, top: 0, width: 390, height: 844 });
    const composer = await page.locator(".ai-composer").evaluate((el) => el.getBoundingClientRect().toJSON());
    expect(composer.bottom).toBeLessThanOrEqual(844 + 1);
    expect(composer.top).toBeGreaterThan(400);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    for (const tile of await panel(page).locator(".ai-quick-tile").all()) {
      const r = await tile.boundingBox();
      expect(r!.x).toBeGreaterThanOrEqual(0);
      expect(r!.x + r!.width).toBeLessThanOrEqual(390);
    }
    // The page behind is held still, and the Lite toggle is out of the way of the composer.
    await expect(page.locator(".lite-root")).toHaveCSS("opacity", "0");
    await page.locator(".ai-icon-btn").last().click();
    await expect(panel(page)).not.toHaveAttribute("data-open", "");
    await expect(page.locator(".lite-root")).toHaveCSS("opacity", "1");
  });

  test("with reduced motion the orb and the panel simply are: no animation anywhere in it", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await arrive(page);
    await open(page);
    const names = await page.evaluate(() =>
      [".ai-orb-core", ".ai-orb-ring", ".ai-orb-halo", ".ai-welcome-title", ".ai-quick-tile"].map((s) => getComputedStyle(document.querySelector(s)!).animationName),
    );
    expect(names.every((n) => n === "none")).toBe(true);
  });

  test("the launcher is the size of its orb (its name appears beside it, not in its box)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await arrive(page);
    const r = await launcher(page).evaluate((el) => el.getBoundingClientRect().toJSON());
    expect(r.width).toBe(56);
    expect(r.height).toBe(56);
    await launcher(page).hover();
    await expect(launcher(page).locator(".ai-launcher-label")).toHaveCSS("opacity", "1", { timeout: 3000 });
  });
});
