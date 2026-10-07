import { getCv, type CvLang } from "@/data/cv";

/**
 * The miniature of a CV that the download chooser draws on each edition's card. It is not decoration: every
 * heading is a section the PDF really has, and every line is one of its real entries, as long as the text is
 * (so the Indonesian sheet, whose sentences run longer, looks a little different from the English one).
 */

export interface SheetBlock {
  heading: string;
  /** Line lengths as a percentage of the sheet's width. */
  lines: number[];
}

/** The most lines one section draws; the sheet is a thumbnail, not a transcript. */
export const MAX_LINES = 4;

const MIN_PCT = 28;
/** A line of this many characters fills the sheet. */
const FULL_CHARS = 110;

export function widthOf(text: string): number {
  return Math.round(Math.min(100, Math.max(MIN_PCT, MIN_PCT + (text.length / FULL_CHARS) * (100 - MIN_PCT))));
}

/** A paragraph as the lines it would fill: full lines, then the rest. */
function wrapped(text: string, perLine = 96): number[] {
  const lines: number[] = [];
  for (let at = 0; at < text.length; at += perLine) lines.push(widthOf(text.slice(at, at + perLine)));
  return lines;
}

export function sheetPlan(lang: CvLang): SheetBlock[] {
  const c = getCv(lang);
  const cap = (lines: number[]) => lines.slice(0, MAX_LINES);
  return [
    { heading: c.headings.profile, lines: cap(wrapped(c.summary).map((w, i, all) => (i < all.length - 1 ? 100 : w))) },
    { heading: c.headings.education, lines: cap(c.education.flatMap((e) => [widthOf(e.school), widthOf([e.program, ...e.notes].join(" · "))])) },
    { heading: c.headings.experience, lines: cap(c.experience.flatMap((e) => [widthOf(`${e.title} ${e.org}`), ...e.bullets.map(widthOf)])) },
    { heading: c.headings.projects, lines: cap(c.projects.flatMap((p) => [widthOf(p.title), widthOf(p.desc)])) },
    { heading: c.headings.skills, lines: cap(c.skills.map((g) => widthOf(g.items.join(", ")))) },
    { heading: c.headings.credentials, lines: cap(c.credentials.map((x) => widthOf(`${x.title} ${x.issuer}`))) },
    { heading: c.headings.languages, lines: cap(c.languages.map((l) => widthOf(`${l.name} ${l.level}`))) },
  ];
}
