/**
 * The type-specimen guides across the hero: for each line of the headline, a hairline at its cap
 * height and one at its baseline, labelled with the real measurement. Pure, so the arithmetic and
 * the pointer logic can be tested; specimenField.ts does the measuring in the browser.
 */

export type GuideKind = "cap" | "base";

export interface Guide {
  /** 0-based line of the headline this guide belongs to. */
  line: number;
  kind: GuideKind;
  /** Distance from the top of the hero, in px. */
  y: number;
  /** What the label says: the measurement, in px. */
  label: string;
}

const round = (n: number) => Math.round(n);

/**
 * Two guides per line. `baselines` are the baselines' y positions in the hero; `fontSize` is the
 * headline's size in px; `capRatio` is the cap height as a fraction of it (measured from the font).
 */
export function buildGuides(baselines: readonly number[], fontSize: number, capRatio: number): Guide[] {
  if (!(fontSize > 0) || !(capRatio > 0) || !Number.isFinite(fontSize) || !Number.isFinite(capRatio)) return [];
  const cap = fontSize * capRatio;
  const out: Guide[] = [];
  baselines.forEach((baseline, line) => {
    if (!Number.isFinite(baseline)) return;
    out.push({ line, kind: "cap", y: baseline - cap, label: `CAP ${round(cap)}` });
    out.push({ line, kind: "base", y: baseline, label: "BASE" });
  });
  return out;
}

/** The index of the guide nearest `y` if it is within `threshold` px, else -1. */
export function nearestGuide(y: number, guides: readonly Pick<Guide, "y">[], threshold = 44): number {
  if (!Number.isFinite(y) || guides.length === 0) return -1;
  let best = -1;
  let gap = threshold;
  guides.forEach((g, i) => {
    const d = Math.abs(g.y - y);
    if (d <= gap) {
      gap = d;
      best = i;
    }
  });
  return best;
}

/** Cap height as a fraction of the font size, from a canvas measurement; 0 when it cannot be read. */
export function capRatioFrom(ascent: number, fontSize: number): number {
  if (!(fontSize > 0) || !(ascent > 0) || !Number.isFinite(ascent) || !Number.isFinite(fontSize)) return 0;
  return ascent / fontSize;
}
