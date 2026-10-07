import { describe, expect, it } from "vitest";
import { BAYS, archiveUse, findTool } from "@/lib/build/stack";
import { projects } from "@/data/projects";
import { FEATURES } from "@/components/ui/wb/features";

const archive = projects.map((p) => ({ title: p.title, tech: p.tech }));
const countOf = (id: string) => archiveUse(findTool(id)!.tool, archive).length;

describe("what I build, as data", () => {
  it("is three disciplines with six, six and five tools", () => {
    expect(BAYS.map((b) => b.tools.length)).toEqual([6, 6, 5]);
    expect(BAYS.map((b) => b.callsign)).toEqual(["HELM", "REACTOR", "PROBE"]);
  });

  it("gives every tool a drawing, a unique id, and words (a tag and one sentence)", () => {
    const ids = BAYS.flatMap((b) => b.tools.map((t) => t.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(FEATURES[id], `a mark for ${id}`).toBeDefined();
    // And no mark for a tool that is not listed.
    expect(Object.keys(FEATURES).sort()).toEqual([...ids].sort());
    for (const t of BAYS.flatMap((b) => b.tools)) {
      expect(t.tag.length).toBeGreaterThan(2);
      expect(t.role.endsWith(".")).toBe(true);
      expect(t.role.split(" ").length).toBeLessThanOrEqual(20);
    }
  });

  it("puts every mark on its plate's square, clear of the corner the plate above hides", () => {
    for (const t of BAYS.flatMap((b) => b.tools)) {
      const [x, y] = FEATURES[t.id]!.at;
      expect(x).toBeGreaterThan(20);
      expect(y).toBeGreaterThan(20);
      expect(x).toBeLessThan(200);
      expect(y).toBeLessThan(200);
      // The plate above covers the part of this one near its back corner (where x + y is small).
      expect(x + y).toBeGreaterThan(120);
    }
  });

  it("keeps the marks of one plate apart", () => {
    for (const bay of BAYS) {
      const at = bay.tools.map((t) => FEATURES[t.id]!.at);
      for (let i = 0; i < at.length; i++) {
        for (let j = i + 1; j < at.length; j++) {
          const d = Math.hypot(at[i]![0] - at[j]![0], at[i]![1] - at[j]![1]);
          expect(d, `${bay.tools[i]!.id} and ${bay.tools[j]!.id}`).toBeGreaterThanOrEqual(56);
        }
      }
    }
  });
});

describe("what the archive shows", () => {
  it("counts a tool under every spelling the archive uses for it, once per project", () => {
    // The archive spells Phaser both "Phaser.js" and "Phaser JS", and Canvas both "Canvas API" and "HTML5 Canvas".
    const phaser = archive.filter((p) => /phaser/i.test(p.tech)).length;
    expect(phaser).toBeGreaterThanOrEqual(3);
    expect(countOf("phaser")).toBe(phaser);
    const canvas = archive.filter((p) => /canvas/i.test(p.tech)).length;
    expect(countOf("canvas")).toBe(canvas);
    // GSAP and its plugin are one tool.
    expect(countOf("gsap")).toBe(archive.filter((p) => /gsap|scrolltrigger/i.test(p.tech)).length);
  });

  it("says nothing for a tool the archive does not list", () => {
    for (const id of ["react", "next", "node", "laravel", "php", "mysql", "postgres", "docker", "rn", "flutter", "figma"]) {
      expect(countOf(id), id).toBe(0);
    }
  });

  it("reads the real data: indexes point at projects that name the tool", () => {
    const three = archiveUse(findTool("three")!.tool, archive);
    expect(three.length).toBeGreaterThan(0);
    for (const i of three) expect(archive[i]!.tech.toLowerCase()).toMatch(/three\.js|webgl/);
    expect([...three].sort((a, b) => a - b)).toEqual(three);
  });

  it("matches whole names, not parts of them (TypeScript is not JavaScript)", () => {
    const ts = archiveUse(findTool("typescript")!.tool, archive);
    for (const i of ts) expect(archive[i]!.tech.toLowerCase()).toContain("typescript");
    expect(archiveUse({ aliases: ["java"] }, [{ title: "x", tech: "JavaScript, Java" }])).toEqual([0]);
    expect(archiveUse({ aliases: ["java"] }, [{ title: "x", tech: "JavaScript" }])).toEqual([]);
  });

  it("finds a tool by id, and nothing for an unknown one", () => {
    expect(findTool("docker")?.bay).toBe(1);
    expect(findTool("nope")).toBeNull();
  });
});
