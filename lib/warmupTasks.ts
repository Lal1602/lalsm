import { registerWarmup } from "./warmup";

/**
 * Everything that gets prepared behind the preloader. Each entry dynamic-imports
 * its own module so the preloader itself stays light, and returns the finished
 * work for the section to adopt (see warmValue in lib/warmup.ts).
 *
 * Entries are added as the sections that need them are built.
 */

let registered = false;

export function registerWarmupTasks(): void {
  if (registered) return;
  registered = true;

  // The shared nebula renderer: create the GL context, compile and link the
  // shader, and force the driver to finish, so the seams never compile on arrival.
  registerWarmup({
    name: "space",
    timeoutMs: 4000,
    run: async () => {
      const { getSpaceRenderer } = await import("./space/SpaceRenderer");
      return getSpaceRenderer().init();
    },
  });

  // The Projects plates: WebGL context, shader, texture atlas, the first plates
  // decoded and uploaded, one frame drawn. Skipped in Lite mode, which shows a plain
  // grid and should not spend the bandwidth.
  registerWarmup({
    name: "plates",
    timeoutMs: 6500,
    run: async () => {
      if (typeof document === "undefined" || document.documentElement.getAttribute("data-lite") === "1") return null;
      const [{ getPlateRenderer }, { projects }] = await Promise.all([
        import("./plates/PlateRenderer"),
        import("@/data/projects"),
      ]);
      return getPlateRenderer(projects);
    },
  });

  // Framer Motion's feature bundle (drag, pan, gestures). The "m" components are inert
  // until it has loaded, so without this a motion-driven part of the page (the How I Work
  // ship, its clock) sits at its server-rendered start state until the chunk arrives, which
  // on a slow connection or a busy device is seconds after the visitor gets there.
  registerWarmup({
    name: "motion",
    timeoutMs: 5000,
    run: async () => {
      await import("../components/motion/features");
    },
  });

  // The Horizon's tube background: its first frame is drawn off screen (see lib/tubesWarm.ts), so
  // arriving at the Playground does not pay for pipeline creation. Lite has no tubes to wait for.
  registerWarmup({
    name: "tubes",
    timeoutMs: 5000,
    run: async () => {
      if (typeof document === "undefined" || document.documentElement.getAttribute("data-lite") === "1") return;
      const { whenTubesWarmed } = await import("./tubesWarm");
      await whenTubesWarmed();
    },
  });

  // Critical display fonts: the first paint of every section depends on them.
  registerWarmup({
    name: "fonts",
    timeoutMs: 3000,
    run: async () => {
      if (typeof document === "undefined" || !("fonts" in document)) return;
      await Promise.all([
        document.fonts.load('500 24px "Cormorant Garamond"'),
        document.fonts.load('italic 400 24px "Cormorant Garamond"'),
        document.fonts.load('500 14px "Space Grotesk"'),
        document.fonts.load('400 12px "Roboto Mono"'),
      ]);
    },
  });
}
