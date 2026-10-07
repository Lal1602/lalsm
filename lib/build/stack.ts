/**
 * What I Build, as data: three disciplines, the tools of each, and what the public archive shows of them.
 *
 * Everything the section draws is read from here. A tool has a one-line role (what it is for, said plainly) and the
 * names it goes by in the archive's own tech lists (data/projects.ts), so the section can say, with no invention, in
 * how many of the archive's projects a tool actually appears. A tool that does not appear there says nothing about it.
 */

export type BayTone = "cyan" | "violet" | "gold";
export type BayGlyph = "helm" | "reactor" | "probe";

export interface Tool {
  /** Key of the drawing on the plate (components/ui/wb/features.tsx). */
  id: string;
  name: string;
  /** Two or three words: what it is for. */
  tag: string;
  /** One sentence, no more. */
  role: string;
  /** How the archive's tech lists spell it, if they do. */
  aliases: readonly string[];
}

export interface Bay {
  code: string;
  callsign: string;
  tone: BayTone;
  glyph: BayGlyph;
  title: readonly [string, string];
  brief: string;
  /** What the plate is, in the drawing's own terms. */
  plate: string;
  tools: readonly Tool[];
}

export const BAYS: readonly Bay[] = [
  {
    code: "SYS-01",
    callsign: "HELM",
    tone: "cyan",
    glyph: "helm",
    title: ["Frontend", "Engineering"],
    brief: "The part you touch. Typed components, motion that carries meaning, and a frame budget I hold to on a mid-range phone.",
    plate: "The interface",
    tools: [
      { id: "typescript", name: "TypeScript", tag: "typed UI", role: "Props and API responses are typed, so a refactor breaks the build and not a page.", aliases: ["typescript"] },
      { id: "react", name: "React", tag: "components", role: "State kept in small components, so the page stays a tree I can reason about.", aliases: [] },
      { id: "next", name: "Next.js", tag: "routes and rendering", role: "App Router, server components and static output. This site is one.", aliases: [] },
      { id: "gsap", name: "GSAP", tag: "timeline motion", role: "Timelines and ScrollTrigger for choreography that has to land on cue.", aliases: ["gsap", "scrolltrigger"] },
      { id: "three", name: "Three.js", tag: "WebGL scenes", role: "Shaders and instanced meshes, where a flat page is not enough.", aliases: ["three.js", "webgl"] },
      { id: "tailwind", name: "Tailwind", tag: "utility styling", role: "Utility classes for layout work that has to be fast and consistent.", aliases: ["tailwind css"] },
    ],
  },
  {
    code: "SYS-02",
    callsign: "REACTOR",
    tone: "violet",
    glyph: "reactor",
    title: ["Backend &", "DevOps"],
    brief: "The part you do not. Schema design, APIs that stay honest under load, and the pipelines that get them shipped.",
    plate: "The services",
    tools: [
      { id: "node", name: "Node.js", tag: "runtime and APIs", role: "Event-loop servers and tooling, in the same language as the front end.", aliases: [] },
      { id: "laravel", name: "Laravel", tag: "MVC framework", role: "Routes, controllers, migrations and queues on a framework that stays out of the way.", aliases: [] },
      { id: "php", name: "PHP", tag: "server logic", role: "Plain PHP where a framework would be heavier than the job.", aliases: [] },
      { id: "mysql", name: "MySQL", tag: "relational data", role: "Schemas, indexes and queries for transactional data.", aliases: [] },
      { id: "postgres", name: "PostgreSQL", tag: "relational data", role: "When the data wants stricter types, JSON columns or heavier queries.", aliases: [] },
      { id: "docker", name: "Docker", tag: "packaging", role: "One image from laptop to server, so the pipeline ships what was tested.", aliases: [] },
    ],
  },
  {
    code: "SYS-03",
    callsign: "PROBE",
    tone: "gold",
    glyph: "probe",
    title: ["Mobile &", "Game Dev"],
    brief: "Sent out past the browser. Cross-platform builds and hand-tuned game loops, where input latency is the whole experience.",
    plate: "The runtime",
    tools: [
      { id: "rn", name: "React Native", tag: "mobile apps", role: "One codebase for both phones, with native modules when the JavaScript side runs out.", aliases: [] },
      { id: "flutter", name: "Flutter", tag: "mobile UI", role: "Widget-driven interfaces on a single rendering engine for every device.", aliases: [] },
      { id: "phaser", name: "Phaser.js", tag: "browser games", role: "Scenes, sprites and arcade physics for games that run in a tab.", aliases: ["phaser.js", "phaser js"] },
      { id: "canvas", name: "Canvas API", tag: "2D drawing", role: "Hand-rolled loops and drawing, for games and generative work.", aliases: ["canvas api", "html5 canvas"] },
      { id: "figma", name: "Figma", tag: "design and handoff", role: "Layouts and prototypes before code, then specs that survive the handoff.", aliases: [] },
    ],
  },
];

/** The slice of an archive entry this needs. */
export interface ArchiveEntry {
  title: string;
  /** Comma separated, as in data/projects.ts. */
  tech: string;
}

const norm = (s: string) => s.trim().toLowerCase();

/**
 * The indexes (into the archive, in order) of the projects whose tech list names this tool, under any of its
 * spellings. Empty when the archive does not show it: nothing is claimed then.
 */
export function archiveUse(tool: Pick<Tool, "aliases">, archive: readonly ArchiveEntry[]): number[] {
  if (tool.aliases.length === 0) return [];
  const names = new Set(tool.aliases.map(norm));
  const out: number[] = [];
  archive.forEach((entry, i) => {
    if (entry.tech.split(",").some((t) => names.has(norm(t)))) out.push(i);
  });
  return out;
}

/** A tool by id, across every bay. */
export function findTool(id: string): { bay: number; tool: Tool } | null {
  for (let b = 0; b < BAYS.length; b++) {
    const tool = BAYS[b]!.tools.find((t) => t.id === id);
    if (tool) return { bay: b, tool };
  }
  return null;
}
