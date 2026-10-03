import { describe, expect, it } from "vitest";
import { buildCvPdf } from "@/lib/cv/buildCvPdf";
import { featuredProjectSlugs } from "@/data/profile";
import { getProject } from "@/data/projects";

describe("CV", () => {
  it("generates a real PDF", async () => {
    const bytes = await buildCvPdf();
    expect(Buffer.from(bytes.slice(0, 5)).toString("latin1")).toBe("%PDF-");
    expect(bytes.byteLength).toBeGreaterThan(2000);
  });

  it("only features projects that exist", () => {
    for (const slug of featuredProjectSlugs) expect(getProject(slug), slug).toBeDefined();
  });
});
