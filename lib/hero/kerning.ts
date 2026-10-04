/**
 * The headline is set one letter per element so each can move on its own. Splitting a word that way
 * stops the browser from kerning across the gaps, so the pairs the font actually kerns are put back
 * by hand, in em, as a negative margin on the second letter of the pair.
 *
 * Measured from Space Grotesk 700 (canvas measureText with kerning on, width of the pair minus the
 * widths of its two letters). Only these pairs of CREATIVE and DEVELOPER differ from zero.
 */
export const KERN_PAIRS: Readonly<Record<string, number>> = {
  AT: -0.064,
  LO: -0.024,
};

/** The kerning, in em, to apply before `letter` when it follows `previous`. */
export function kernBefore(previous: string | undefined, letter: string): number {
  if (!previous) return 0;
  return KERN_PAIRS[(previous + letter).toUpperCase()] ?? 0;
}
