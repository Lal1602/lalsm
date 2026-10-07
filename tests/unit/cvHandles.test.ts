import { beforeEach, describe, expect, it } from "vitest";
import { cvUpdated, cvUpdatedLabel } from "@/data/cv";
import { openCvChooser, reportCvChooserOpen, resetCvChooser, takeCvChooserReturn } from "@/lib/cv/chooser";
import { NUDGE_AFTER_MS, shouldNudge, type NudgeInput } from "@/lib/cv/nudge";

describe("when the CV tab speaks", () => {
  const ready: NudgeInput = { calm: false, alreadyNudged: false, splashUp: false, chooserOpen: false, evidenceSeen: false, elapsedMs: 0 };

  it("stays quiet at first: nothing seen, nothing waited", () => {
    expect(shouldNudge(ready)).toBe(false);
    expect(shouldNudge({ ...ready, elapsedMs: NUDGE_AFTER_MS - 1 })).toBe(false);
  });

  it("speaks when the visitor has reached the evidence, or has been reading long enough", () => {
    expect(shouldNudge({ ...ready, evidenceSeen: true })).toBe(true);
    expect(shouldNudge({ ...ready, elapsedMs: NUDGE_AFTER_MS })).toBe(true);
  });

  it("speaks once per visit, never over the splash or the chooser, never to a visitor who asked for calm", () => {
    const wants = { ...ready, evidenceSeen: true };
    expect(shouldNudge({ ...wants, alreadyNudged: true })).toBe(false);
    expect(shouldNudge({ ...wants, splashUp: true })).toBe(false);
    expect(shouldNudge({ ...wants, chooserOpen: true })).toBe(false);
    expect(shouldNudge({ ...wants, calm: true })).toBe(false);
  });
});

describe("the CV chooser's store", () => {
  beforeEach(() => resetCvChooser());

  it("takes the focus target of the handle that asked, once", () => {
    const handle = { focus: () => undefined } as unknown as HTMLElement;
    openCvChooser("nav", handle);
    expect(takeCvChooserReturn()).toBe(handle);
    expect(takeCvChooserReturn()).toBeNull();
  });

  it("ignores a second request while it is open, and accepts one after it has closed", () => {
    const a = { focus: () => undefined } as unknown as HTMLElement;
    const b = { focus: () => undefined } as unknown as HTMLElement;
    openCvChooser("hero", a);
    openCvChooser("tab", b);
    expect(takeCvChooserReturn()).toBe(a);
    reportCvChooserOpen(false);
    openCvChooser("tab", b);
    expect(takeCvChooserReturn()).toBe(b);
  });
});

describe("how up to date the CV says it is", () => {
  it("prints the month it was last brought up to date, the same wherever it runs", () => {
    expect(cvUpdated).toMatch(/^\d{4}-\d{2}$/);
    expect(cvUpdatedLabel()).toBe("Oct 2026");
  });
});
