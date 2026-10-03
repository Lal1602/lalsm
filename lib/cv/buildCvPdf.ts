import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { achievements } from "@/data/achievements";
import { education, featuredProjectSlugs, profile, skillGroups, timeline } from "@/data/profile";
import { getProject } from "@/data/projects";
import { siteUrl } from "@/lib/site";

/**
 * Builds the CV as a real PDF from the same data the site renders, so it can
 * never drift out of date. Uses only the built-in Helvetica fonts (no font
 * files to ship), which means text must be WinAnsi-safe — see `clean`.
 */

const PAGE_W = 595.28; // A4
const PAGE_H = 841.89;
const MARGIN = 48;
const CONTENT_W = PAGE_W - MARGIN * 2;

const INK = rgb(0.07, 0.07, 0.09);
const MUTED = rgb(0.33, 0.35, 0.4);
const ACCENT = rgb(0.04, 0.36, 0.48);
const RULE = rgb(0.82, 0.84, 0.88);

/** Replaces the few characters Helvetica/WinAnsi cannot encode. */
function clean(text: string): string {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/↗/g, "")
    .replace(/[^\x20-\x7E -ÿ–—•…]/g, "");
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

export async function buildCvPdf(): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${profile.name} — Curriculum Vitae`);
  pdf.setAuthor(profile.name);
  pdf.setSubject("Curriculum Vitae");
  pdf.setCreator(siteUrl);

  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page: PDFPage = pdf.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  /** Starts a new page when `needed` points would not fit above the bottom margin. */
  const ensure = (needed: number) => {
    if (y - needed < MARGIN) {
      page = pdf.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
    }
  };

  const text = (value: string, opts: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb>; x?: number }) => {
    const { font = regular, size = 10, color = INK, x = MARGIN } = opts;
    page.drawText(clean(value), { x, y, font, size, color });
  };

  const paragraph = (value: string, opts: { size?: number; color?: ReturnType<typeof rgb>; gap?: number } = {}) => {
    const { size = 10, color = MUTED, gap = 3 } = opts;
    const leading = size * 1.4;
    for (const line of wrap(value, regular, size, CONTENT_W)) {
      ensure(leading);
      y -= leading;
      text(line, { size, color });
    }
    y -= gap;
  };

  const heading = (label: string) => {
    ensure(40);
    y -= 26;
    text(label.toUpperCase(), { font: bold, size: 9, color: ACCENT });
    y -= 6;
    page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.6, color: RULE });
  };

  /** Bold title on the left, a muted detail right-aligned on the same line. */
  const itemHead = (title: string, detail: string) => {
    ensure(34);
    y -= 18;
    text(title, { font: bold, size: 10.5 });
    const d = clean(detail);
    if (d) {
      const w = regular.widthOfTextAtSize(d, 9);
      text(d, { size: 9, color: MUTED, x: PAGE_W - MARGIN - w });
    }
  };

  // ── Header ──────────────────────────────────────────────────────────────
  y -= 22;
  text(profile.name, { font: bold, size: 24 });
  y -= 18;
  text(profile.role, { size: 11, color: ACCENT });
  y -= 15;
  text(`${profile.location}   |   ${profile.email}   |   ${siteUrl.replace(/^https?:\/\//, "")}`, {
    size: 9,
    color: MUTED,
  });
  y -= 12;
  text(`github.com/${profile.github.split("/").pop()}`, { size: 9, color: MUTED });

  // ── Summary ─────────────────────────────────────────────────────────────
  heading("Profile");
  y -= 2;
  paragraph(profile.summary, { size: 10.5 });

  // ── Skills ──────────────────────────────────────────────────────────────
  heading("Skills");
  for (const group of skillGroups) {
    ensure(18);
    y -= 16;
    text(group.label, { font: bold, size: 9.5 });
    const labelW = bold.widthOfTextAtSize(clean(group.label), 9.5) + 10;
    const lines = wrap(group.items.join(", "), regular, 9.5, CONTENT_W - labelW - 4);
    lines.forEach((line, i) => {
      if (i > 0) {
        ensure(13);
        y -= 13;
      }
      text(line, { size: 9.5, color: MUTED, x: MARGIN + labelW });
    });
  }

  // ── Education ───────────────────────────────────────────────────────────
  heading("Education");
  for (const item of education) {
    itemHead(item.school, item.period);
    y -= 2;
    paragraph(item.program);
  }

  // ── Experience & training ───────────────────────────────────────────────
  heading("Training, certification & competition");
  for (const item of [...timeline].reverse()) {
    itemHead(`${item.role} — ${item.institution}`, item.year);
    y -= 2;
    paragraph(item.desc);
  }

  // ── Selected projects ───────────────────────────────────────────────────
  heading("Selected projects");
  for (const slug of featuredProjectSlugs) {
    const project = getProject(slug);
    if (!project) continue;
    itemHead(project.title, project.link ? project.link.replace(/^https?:\/\//, "").replace(/\/$/, "") : "");
    y -= 2;
    paragraph(`${project.desc} (${project.tech})`);
  }

  // ── Certificates ────────────────────────────────────────────────────────
  heading("Certificates & awards");
  for (const a of achievements) {
    ensure(14);
    y -= 13;
    text(`•  ${a.title}`, { size: 9.5 });
    const meta = clean(a.meta);
    const w = regular.widthOfTextAtSize(meta, 8.5);
    text(meta, { size: 8.5, color: MUTED, x: PAGE_W - MARGIN - Math.min(w, CONTENT_W * 0.38) });
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
