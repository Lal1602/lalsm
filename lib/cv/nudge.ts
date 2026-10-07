/**
 * When the CV tab at the edge of the page says something. It says it once per visit, at the moment that is most
 * likely to be the right one: the visitor has reached the evidence (the achievements and the career record), or has
 * simply been reading for a while. It never interrupts the splash or the chooser, and it never moves for a visitor who
 * asked for calm (reduced motion, or Lite) — for them the tab is just there.
 */

/** Reading this long without reaching the evidence is a reason too. */
export const NUDGE_AFTER_MS = 45_000;
/** How long the tab stays out once it has spoken. */
export const NUDGE_SHOW_MS = 4500;
/** sessionStorage: it has spoken in this visit. */
export const NUDGE_KEY = "cv-tab-nudged";

export interface NudgeInput {
  calm: boolean;
  alreadyNudged: boolean;
  splashUp: boolean;
  chooserOpen: boolean;
  evidenceSeen: boolean;
  elapsedMs: number;
}

export function shouldNudge(input: NudgeInput): boolean {
  if (input.calm || input.alreadyNudged || input.splashUp || input.chooserOpen) return false;
  return input.evidenceSeen || input.elapsedMs >= NUDGE_AFTER_MS;
}
