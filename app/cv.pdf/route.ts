import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { buildCvPdf } from "@/lib/cv/buildCvPdf";

/**
 * GET /cv.pdf — the downloadable CV.
 *
 * If a hand-made PDF exists at public/cv/Bilal-Sanayu-Majid-CV.pdf it is served
 * as-is, so dropping a designed CV in later needs no code change. Until then the
 * PDF is generated from the site's own data (see lib/cv/buildCvPdf.ts).
 */

const FILE_NAME = "Bilal-Sanayu-Majid-CV.pdf";
const CUSTOM_PATH = join(process.cwd(), "public", "cv", FILE_NAME);

export const dynamic = "force-static";

export async function GET() {
  let body: Uint8Array;
  try {
    body = await readFile(CUSTOM_PATH);
  } catch {
    body = await buildCvPdf();
  }

  return new Response(body as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${FILE_NAME}"`,
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
