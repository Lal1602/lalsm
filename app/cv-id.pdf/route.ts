import { cvPdfResponse } from "@/lib/cv/cvResponse";

/** GET /cv-id.pdf: the downloadable CV in Indonesian (the English one is /cv.pdf). See lib/cv/cvResponse.ts. */

export const dynamic = "force-static";

export async function GET() {
  return cvPdfResponse("id");
}
