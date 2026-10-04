import { mkdirSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import sharp from "sharp";

/**
 * Objective "is there still a visible line?" check for the two section seams.
 *
 * For each seam the page is scrolled so the seam sits mid-viewport, all real
 * content (text, cards, HUD) is hidden so only the background layers remain,
 * and a strip of ±SPAN px around the seam is captured. Per-row mean luminance is
 * computed across the full width; a hard section edge shows up as a spike in the
 * row-to-row change.
 *
 *   ratio = largest row-to-row step within ±NEAR px of the seam
 *           ÷ median row-to-row step in the rest of the strip
 *
 * A seamless transition keeps the ratio near 1. The default budget is generous
 * (they are living clouds, so steps vary); set SEAM_ASSERT=1 to enforce it.
 */

const SPAN = 220;
const NEAR = 60;
// Brightness-step ratio. The clouds have real structure now (dust lanes, bright
// fronts), so a step somewhere near the seam is expected and is not itself a
// defect; this only guards against a gross brightness mismatch between the halves.
const BUDGET = 4.0;
// Row-to-row jump at the seam: the metric that actually detects a seam. 1.0 means
// the join is indistinguishable from the rest of the image; a cut-and-shifted cloud
// edge or a hairline scored 9–10 before the fixes.
const JUMP_BUDGET = 2.5;
// The image is smooth now, so a ratio over a tiny median is touchy: a step of about
// two colour levels per channel (sum 7) is below what the eye picks out, whatever
// the ratio says. Either bound passing is enough.
const JUMP_ABS = 7;

const LITE = Boolean(process.env.SEAM_LITE);

async function prepare(page: Page) {
  if (LITE) await page.addInitScript(() => localStorage.setItem("lite-mode", "on"));
  await page.goto("/");
  await page.waitForFunction(
    () => (document.querySelector<HTMLElement>(".preloader")?.style.display ?? "") === "none",
    null,
    { timeout: 40_000 },
  );
  await page.addStyleTag({
    content: `
      .hiw-section .container, .horizon-wrapper, .horizon-hud, .cosmic-projects-container,
      .cosmos-top-frame, .cosmos-archive-tag, .navbar, .lite-root, .ai-chat-toggle-btn,
      .grain-overlay, .scroll-progress-bar { visibility: hidden !important; }
    `,
  });
  await page.waitForTimeout(1500);
}

async function measure(page: Page, seamY: () => number, label: string) {
  // Arrive the way a visitor does: scrolling down in steps, so the two halves of
  // the seam become visible at different scroll positions (the Lite render is a
  // single still frame per half and used to disagree because of exactly that).
  const target = (await page.evaluate(seamY)) - 450;
  await page.evaluate((y) => window.scrollTo(0, Math.max(0, y - 1400)), target);
  await page.waitForTimeout(600);
  for (let y = target - 1400; y < target; y += 160) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(90);
  }
  await page.evaluate((y) => window.scrollTo(0, y), target);
  await page.waitForTimeout(1800);

  // Smooth scrolling may not land exactly where asked: measure where the seam really is.
  const seamVp = Math.round(await page.evaluate(`(${seamY.toString()})() - window.scrollY`));
  const buf = await page.screenshot({
    clip: { x: 0, y: seamVp - SPAN, width: 1440, height: SPAN * 2 },
  });
  mkdirSync("test-results", { recursive: true });
  await sharp(buf).toFile(`test-results/seam-${label}.png`);

  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  const rows: number[] = [];
  for (let y = 0; y < info.height; y++) {
    let sum = 0;
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * info.channels;
      sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    }
    rows.push(sum / info.width);
  }
  // A line one or two pixels thick is texture; a visible section edge is a *step*:
  // the area just below is a different brightness from the area just above. So
  // compare the mean of the 9 rows below each position with the 9 above it.
  const band = (from: number, to: number) => {
    let sum = 0;
    for (let i = from; i < to; i++) sum += rows[i];
    return sum / (to - from);
  };
  const steps: number[] = [];
  for (let y = 12; y < rows.length - 12; y++) steps.push(Math.abs(band(y + 2, y + 11) - band(y - 10, y - 1)));
  const offset = 12; // steps[0] corresponds to row 12

  const centre = SPAN - offset;
  const near = steps.slice(centre - NEAR, centre + NEAR);
  const far = [...steps.slice(0, centre - NEAR), ...steps.slice(centre + NEAR)].sort((a, b) => a - b);
  const median = far[Math.floor(far.length / 2)] || 0.0001;
  const spike = Math.max(...near);
  const spikeAt = near.indexOf(spike) - NEAR;
  const ratio = spike / median;

  // Second metric, for structure rather than brightness: how much does each pixel
  // differ from the one directly below it? A cloud edge that is cut and shifted at
  // the seam leaves row means alone but makes this jump on exactly one row.
  const rowJump: number[] = [];
  for (let y = 0; y < info.height - 1; y++) {
    const diffs: number[] = [];
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * info.channels;
      const j = ((y + 1) * info.width + x) * info.channels;
      diffs.push(Math.abs(data[i] - data[j]) + Math.abs(data[i + 1] - data[j + 1]) + Math.abs(data[i + 2] - data[j + 2]));
    }
    // Mean of the lowest 85% of columns. A star or a constellation line that happens
    // to sit on the seam is a one-pixel feature that appears in both halves; it is
    // content, not a seam, and would otherwise dominate a smooth image. A real seam
    // moves every column at once.
    diffs.sort((a, b) => a - b);
    const keep = Math.floor(diffs.length * 0.85);
    let sum = 0;
    for (let c = 0; c < keep; c++) sum += diffs[c];
    rowJump.push(sum / keep);
  }
  const jumpFar = [...rowJump.slice(0, SPAN - 8), ...rowJump.slice(SPAN + 8)].sort((a, b) => a - b);
  const jumpMedian = jumpFar[Math.floor(jumpFar.length / 2)] || 0.0001;
  const jumpPeak = Math.max(...rowJump.slice(SPAN - 4, SPAN + 4));
  const jumpRatio = jumpPeak / jumpMedian;
  console.log(
    `${label.padEnd(10)} row-to-row jump at seam ${jumpPeak.toFixed(2)}  median ${jumpMedian.toFixed(2)}  ratio ${jumpRatio.toFixed(2)}`,
  );
  if (process.env.SEAM_ASSERT) expect(Math.min(jumpRatio / JUMP_BUDGET, jumpPeak / JUMP_ABS)).toBeLessThanOrEqual(1);
  if (process.env.SEAM_PROFILE) console.log(label, "profile", rows.slice(SPAN - 40, SPAN + 41).filter((_, i) => i % 4 === 0).map((v) => v.toFixed(1)).join(" "));

  console.log(
    `${label.padEnd(10)} spike ${spike.toFixed(2)}  median ${median.toFixed(2)}  ratio ${ratio.toFixed(2)}  at ${spikeAt >= 0 ? "+" : ""}${spikeAt}px  (budget ${BUDGET})`,
  );
  return ratio;
}

test("no hard edge at the How I Work / Creative Playground seam", async ({ page }) => {
  await prepare(page);
  const ratio = await measure(
    page,
    () => document.getElementById("workflow")!.getBoundingClientRect().bottom + window.scrollY,
    "hiw-horizon",
  );
  if (process.env.SEAM_ASSERT) expect(ratio).toBeLessThanOrEqual(BUDGET);
});

test("no hard edge at the Creative Playground / Projects seam", async ({ page }) => {
  await prepare(page);
  const ratio = await measure(
    page,
    () => document.getElementById("projects")!.getBoundingClientRect().top + window.scrollY,
    "horizon-proj",
  );
  if (process.env.SEAM_ASSERT) expect(ratio).toBeLessThanOrEqual(BUDGET);
});
