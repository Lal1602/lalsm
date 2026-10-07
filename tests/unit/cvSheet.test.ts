import { describe, expect, it } from "vitest";
import { CV_LANGS, cv, cvFacts } from "@/data/cv";
import { MAX_LINES, sheetPlan, widthOf } from "@/lib/cv/sheet";

describe("the CV thumbnail in the download chooser", () => {
  it("has a block for every section of the CV, headed by that section's own heading", () => {
    for (const lang of CV_LANGS) {
      expect(sheetPlan(lang).map((b) => b.heading)).toEqual(Object.values(cv[lang].headings));
    }
  });

  it("draws at least one line per section, never more than the cap, each within the sheet", () => {
    for (const lang of CV_LANGS) {
      for (const block of sheetPlan(lang)) {
        expect(block.lines.length, block.heading).toBeGreaterThanOrEqual(1);
        expect(block.lines.length, block.heading).toBeLessThanOrEqual(MAX_LINES);
        for (const w of block.lines) {
          expect(w).toBeGreaterThanOrEqual(28);
          expect(w).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it("is longer where the text is longer", () => {
    expect(widthOf("a")).toBeLessThan(widthOf("a".repeat(60)));
    expect(widthOf("a".repeat(60))).toBeLessThan(widthOf("a".repeat(400)));
    expect(widthOf("a".repeat(400))).toBe(100);
  });

  it("states what the CV holds, counted from the data", () => {
    expect(cvFacts("en")).toContain(`${cv.en.projects.length} projects`);
    expect(cvFacts("en")).toContain(`${cv.en.credentials.length} certifications`);
    expect(cvFacts("id")).toContain(`${cv.id.projects.length} proyek`);
  });
});
