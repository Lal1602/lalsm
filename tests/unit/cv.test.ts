import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { CV_LANGS, cv, cvPath, cvPdfName, cvPdfPath, type CvContent } from "@/data/cv";
import { profile } from "@/data/profile";
import { buildCvPdf } from "@/lib/cv/buildCvPdf";

/** Every string a CV carries, so the checks below cover all of it. */
function strings(c: CvContent): string[] {
  return [
    c.summary,
    c.elsewhere,
    ...Object.values(c.headings),
    ...c.education.flatMap((e) => [e.school, e.program, e.period, ...e.notes]),
    ...c.experience.flatMap((e) => [e.title, e.org, e.period, ...e.bullets]),
    ...c.projects.flatMap((p) => [p.title, p.stack, p.desc]),
    ...c.skills.flatMap((g) => [g.label, ...g.items]),
    ...c.credentials.flatMap((x) => [x.title, x.issuer, x.year ?? ""]),
    ...c.languages.flatMap((l) => [l.name, l.level]),
  ];
}

describe("CV", () => {
  it.each(CV_LANGS)("generates a real PDF in %s that fits on two pages", async (lang) => {
    const bytes = await buildCvPdf(lang);
    expect(Buffer.from(bytes.slice(0, 5)).toString("latin1")).toBe("%PDF-");
    expect(bytes.byteLength).toBeGreaterThan(2000);
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBeLessThanOrEqual(2);
    expect(doc.getTitle()).toContain(cv[lang].label);
  });

  it("the two languages tell the same CV: same entries, same order, same links", () => {
    const [en, id] = [cv.en, cv.id];
    const shape = (c: CvContent) => ({
      education: c.education.length,
      experience: c.experience.map((e) => e.bullets.length),
      projects: c.projects.map((p) => p.link ?? null),
      skills: c.skills.map((g) => g.items.length),
      credentials: c.credentials.map((x) => x.year ?? null),
      languages: c.languages.length,
    });
    expect(shape(id)).toEqual(shape(en));
    expect(Object.keys(id.headings)).toEqual(Object.keys(en.headings));
    // The headings and the summary really are translated, not copied.
    expect(id.summary).not.toBe(en.summary);
    expect(id.headings.education).not.toBe(en.headings.education);
  });

  it("only uses characters the PDF's built-in font can draw", () => {
    // Helvetica/WinAnsi: Latin-1 plus a few punctuation marks. Anything else would be silently dropped from the PDF.
    const drawable = /^[\x20-\x7E -ÿ–—•…‘’“”]*$/;
    for (const lang of CV_LANGS) {
      for (const s of strings(cv[lang])) expect(s, `${lang}: ${s}`).toMatch(drawable);
    }
  });

  it("states what the owner said: no GDGoC, English and BISINDO at intermediate, the current e-mail", () => {
    for (const lang of CV_LANGS) {
      expect(strings(cv[lang]).join(" | "), lang).not.toMatch(/GDGoC|Google Developer Groups/i);
      const levels = Object.fromEntries(cv[lang].languages.map((l) => [l.name.split(" (")[0], l.level]));
      const want = lang === "en" ? "Intermediate" : "Menengah";
      expect(levels[lang === "en" ? "English" : "Bahasa Inggris"]).toBe(want);
      expect(levels.BISINDO).toBe(want);
    }
    expect(profile.email).toBe("bilalsanayumajid@gmail.com");
  });

  it("gives each language its own page address and its own PDF", () => {
    expect(cvPath("en")).toBe("/cv");
    expect(cvPath("id")).toBe("/cv/id");
    expect(cvPdfPath("en")).toBe("/cv.pdf");
    expect(cvPdfPath("id")).toBe("/cv-id.pdf");
    expect(cvPdfName("en")).not.toBe(cvPdfName("id"));
  });
});
