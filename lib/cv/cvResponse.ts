import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cvPdfName, type CvLang } from "@/data/cv";
import { buildCvPdf } from "@/lib/cv/buildCvPdf";

/**
 * The response behind /cv.pdf (English) and /cv-id.pdf (Indonesian).
 *
 * If a hand-made PDF exists at public/cv/<name> (Bilal-Sanayu-Majid-CV-EN.pdf or -ID.pdf) it is served as-is, so
 * dropping a designed CV in later needs no code change. Until then the PDF is generated from data/cv.ts.
 */
export async function cvPdfResponse(lang: CvLang): Promise<Response> {
  const name = cvPdfName(lang);
  let body: Uint8Array;
  try {
    body = await readFile(join(process.cwd(), "public", "cv", name));
  } catch {
    body = await buildCvPdf(lang);
  }

  return new Response(body as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${name}"`,
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
