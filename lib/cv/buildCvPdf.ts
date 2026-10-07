import { PDFDocument, PDFString, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { cvContact, getCv, type CvLang } from "@/data/cv";
import { profile } from "@/data/profile";
import { siteUrl } from "@/lib/site";

/**
 * Builds the CV as a real PDF from data/cv.ts, in the language asked for, so the page and the file can never drift
 * apart. Single column, real text and plain headings (it is read by people and by applicant-tracking software), with
 * the built-in Helvetica fonts, so there are no font files to ship; that means text must be WinAnsi-safe (see `clean`).
 */

const PAGE_W = 595.28; // A4
const PAGE_H = 841.89;
const MARGIN = 46;
const CONTENT_W = PAGE_W - MARGIN * 2;
const BULLET_INDENT = 11;

const INK = rgb(0.07, 0.07, 0.09);
const MUTED = rgb(0.31, 0.33, 0.38);
const ACCENT = rgb(0.04, 0.36, 0.48);
const RULE = rgb(0.8, 0.82, 0.86);

type Color = ReturnType<typeof rgb>;

/** Replaces the few characters Helvetica/WinAnsi cannot encode. */
function clean(text: string): string {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/↗/g, "")
    .replace(/[^\x20-\x7E -ÿ–—•…]/g, "");
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of clean(text).split(/\s+/).filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function buildCvPdf(lang: CvLang = "en"): Promise<Uint8Array> {
  const c = getCv(lang);
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${profile.name} — Curriculum Vitae (${c.label})`);
  pdf.setAuthor(profile.name);
  pdf.setSubject("Curriculum Vitae");
  pdf.setCreator(siteUrl);
  pdf.setLanguage(c.tag);

  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);

  let page: PDFPage = pdf.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  /** Starts a new page when `needed` points would not fit above the bottom margin. */
  const ensure = (needed: number) => {
    if (y - needed < MARGIN + 10) {
      page = pdf.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
    }
  };

  const text = (value: string, opts: { font?: PDFFont; size?: number; color?: Color; x?: number }) => {
    const { font = regular, size = 10, color = INK, x = MARGIN } = opts;
    page.drawText(clean(value), { x, y, font, size, color });
  };

  /** Draws right-aligned text on the current line and returns where it starts. */
  const right = (value: string, opts: { font?: PDFFont; size?: number; color?: Color }) => {
    const { font = regular, size = 9 } = opts;
    const v = clean(value);
    const x = PAGE_W - MARGIN - font.widthOfTextAtSize(v, size);
    text(v, { ...opts, x });
    return x;
  };

  /** Makes the box a clickable link. */
  const link = (url: string, x: number, width: number, size: number) => {
    const ref = pdf.context.register(
      pdf.context.obj({
        Type: "Annot",
        Subtype: "Link",
        Rect: [x, y - 2, x + width, y + size],
        Border: [0, 0, 0],
        A: { Type: "Action", S: "URI", URI: PDFString.of(url) },
      }),
    );
    page.node.addAnnot(ref);
  };

  const paragraph = (value: string, opts: { size?: number; color?: Color; gap?: number; x?: number; font?: PDFFont } = {}) => {
    const { size = 9.6, color = MUTED, gap = 2, x = MARGIN, font = regular } = opts;
    const leading = size * 1.42;
    for (const line of wrap(value, font, size, PAGE_W - MARGIN - x)) {
      ensure(leading);
      y -= leading;
      text(line, { size, color, x, font });
    }
    y -= gap;
  };

  const bullets = (items: string[]) => {
    for (const item of items) {
      const lines = wrap(item, regular, 9.6, CONTENT_W - BULLET_INDENT);
      lines.forEach((line, i) => {
        ensure(14);
        y -= 13.6;
        if (i === 0) text("•", { size: 9.6, color: ACCENT, x: MARGIN + 1 });
        text(line, { size: 9.6, color: MUTED, x: MARGIN + BULLET_INDENT });
      });
    }
  };

  const heading = (label: string) => {
    ensure(54);
    y -= 24;
    text(label.toUpperCase(), { font: bold, size: 9.2, color: ACCENT });
    y -= 5;
    page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.6, color: RULE });
  };

  /** Bold title on the left, a muted detail right-aligned on the same line. */
  const itemHead = (title: string, detail: string, detailUrl?: string) => {
    ensure(40);
    y -= 17;
    text(title, { font: bold, size: 10.4 });
    if (detail) {
      const x = right(detail, { size: 8.8, color: detailUrl ? ACCENT : MUTED });
      if (detailUrl) link(detailUrl, x, PAGE_W - MARGIN - x, 8.8);
    }
  };

  // ── Header ──────────────────────────────────────────────────────────────
  y -= 20;
  text(profile.name, { font: bold, size: 25 });
  y -= 18;
  text(profile.role, { size: 11.5, color: ACCENT });

  const github = `github.com/${profile.github.split("/").pop()}`;
  const contact: { label: string; url?: string }[] = [
    { label: profile.location },
    { label: profile.email, url: `mailto:${profile.email}` },
    { label: cvContact.website, url: cvContact.websiteUrl },
    { label: github, url: profile.github },
  ];
  y -= 16;
  let cx = MARGIN;
  contact.forEach((item, i) => {
    if (i > 0) {
      text("|", { size: 9, color: RULE, x: cx + 6 });
      cx += 17;
    }
    const w = regular.widthOfTextAtSize(clean(item.label), 9);
    text(item.label, { size: 9, color: item.url ? INK : MUTED, x: cx });
    if (item.url) link(item.url, cx, w, 9);
    cx += w;
  });
  y -= 12;
  text(c.elsewhere, { size: 8.8, color: MUTED });
  y -= 9;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 1.4, color: ACCENT });

  // ── Profile ─────────────────────────────────────────────────────────────
  heading(c.headings.profile);
  y -= 1;
  paragraph(c.summary, { size: 9.8 });

  // ── Education ───────────────────────────────────────────────────────────
  heading(c.headings.education);
  for (const item of c.education) {
    itemHead(item.school, item.period);
    paragraph([item.program, ...item.notes].join("  ·  "), { gap: 1 });
  }

  // ── Experience ──────────────────────────────────────────────────────────
  heading(c.headings.experience);
  for (const item of c.experience) {
    ensure(84);
    itemHead(item.title, item.period);
    y -= 1;
    paragraph(item.org, { color: ACCENT, font: italic, size: 9.2, gap: 1 });
    bullets(item.bullets);
  }

  // ── Projects ────────────────────────────────────────────────────────────
  heading(c.headings.projects);
  for (const project of c.projects) {
    ensure(76); // a project stays in one piece: title, stack and description
    itemHead(project.title, project.link ? project.link.replace(/^https?:\/\//, "") : "", project.link);
    y -= 1;
    paragraph(project.stack, { color: ACCENT, font: italic, size: 9.2, gap: 1 });
    paragraph(project.desc, { gap: 1 });
  }

  // ── Skills ──────────────────────────────────────────────────────────────
  heading(c.headings.skills);
  const labelW = Math.max(...c.skills.map((g) => bold.widthOfTextAtSize(clean(g.label), 9.4))) + 12;
  for (const group of c.skills) {
    ensure(18);
    y -= 14.5;
    text(group.label, { font: bold, size: 9.4 });
    wrap(group.items.join(", "), regular, 9.4, CONTENT_W - labelW).forEach((line, i) => {
      if (i > 0) {
        ensure(13);
        y -= 12.6;
      }
      text(line, { size: 9.4, color: MUTED, x: MARGIN + labelW });
    });
  }

  // ── Certifications ──────────────────────────────────────────────────────
  heading(c.headings.credentials);
  for (const item of c.credentials) {
    const yearW = item.year ? regular.widthOfTextAtSize(clean(item.year), 8.8) + 14 : 0;
    const titleW = bold.widthOfTextAtSize(clean(item.title), 9.4);
    // Room for the 7pt gap that stands in for the space after the bold title.
    const lines = wrap(`${item.title} — ${item.issuer}`, regular, 9.4, CONTENT_W - BULLET_INDENT - yearW - 8);
    lines.forEach((line, i) => {
      ensure(14);
      y -= 13.4;
      if (i === 0) {
        text("•", { size: 9.4, color: ACCENT, x: MARGIN + 1 });
        if (item.year) right(item.year, { size: 8.8, color: MUTED });
      }
      // The credential's own name in ink, the issuer after it in grey (when the title fits on this line).
      if (i === 0 && titleW <= CONTENT_W - BULLET_INDENT - yearW) {
        const rest = line.slice(clean(item.title).length).trim();
        text(item.title, { font: bold, size: 9.4, x: MARGIN + BULLET_INDENT });
        text(rest, { size: 9.4, color: MUTED, x: MARGIN + BULLET_INDENT + titleW + 7 });
      } else {
        text(line, { size: 9.4, color: MUTED, x: MARGIN + BULLET_INDENT });
      }
    });
  }

  // ── Languages ───────────────────────────────────────────────────────────
  heading(c.headings.languages);
  for (const item of c.languages) {
    ensure(14);
    y -= 13.4;
    text("•", { size: 9.4, color: ACCENT, x: MARGIN + 1 });
    const w = bold.widthOfTextAtSize(clean(item.name), 9.4);
    text(item.name, { font: bold, size: 9.4, x: MARGIN + BULLET_INDENT });
    text(`— ${item.level}`, { size: 9.4, color: MUTED, x: MARGIN + BULLET_INDENT + w + 7 });
  }

  // ── Footer on every page ────────────────────────────────────────────────
  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    p.drawText(clean(`${profile.name} | Curriculum Vitae | ${i + 1}/${pages.length}`), {
      x: MARGIN,
      y: 26,
      size: 8,
      font: regular,
      color: MUTED,
    });
  });

  return pdf.save();
}
