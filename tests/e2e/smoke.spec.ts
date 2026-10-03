import { expect, test } from "@playwright/test";

test.describe("pages", () => {
  test("home page renders with metadata and a working skip link", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/BILAL/);
    await expect(page.locator("h1").first()).toContainText("Creative Developer");

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
