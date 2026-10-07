import { cvPdfResponse } from "@/lib/cv/cvResponse";

/** GET /cv.pdf: the downloadable CV in English (the Indonesian one is /cv-id.pdf). See lib/cv/cvResponse.ts. */

export const dynamic = "force-static";

export async function GET() {
  return cvPdfResponse("en");
}
