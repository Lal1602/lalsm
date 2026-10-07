import { registerWarmup } from "./warmup";
import { taskWeight } from "./splash";

/**
 * Everything that gets prepared behind the preloader: the eight tasks the splash's dial has an arc for
 * (lib/splash.ts keeps their names, labels and weights). Each entry dynamic-imports its own module so the
 * preloader itself stays light, and returns the finished work for the section to adopt (see warmValue in
 * lib/warmup.ts).
 *
 * The `gpu` lane is for the tasks that do heavy work themselves (a context, a shader, a first draw, an atlas):
 * they run one after another with a frame between, so the splash keeps painting. The others only wait (for the
 * network, or for a section that does its own warming as it mounts) and run in parallel.
 */

let registered = false;

const lite = () => typeof document !== "undefined" && document.documentElement.getAttribute("data-lite") === "1";

/** Resolves when `selector` matches an element (watching attribute changes too), or after `ms`. */
function whenMatches(selector: string, ms: number): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) return resolve(true);
    const done = (ok: boolean) => {
      watch.disconnect();
      window.clearTimeout(timer);
      resolve(ok);
    };
    const watch = new MutationObserver(() => {
      if (document.querySelector(selector)) done(true);
    });
    watch.observe(document.documentElement, { subtree: true, childList: true, attributes: true });
    const timer = window.setTimeout(() => done(false), ms);
  });
}

export function registerWarmupTasks(): void {
  if (registered) return;
  registered = true;

  // The hero's portrait dots (they are made by the hero itself once it has hydrated): wait until they are
  // there, so the entrance that starts when the curtain opens is the dot-matrix one and never the plain wipe.
  registerWarmup({
    name: "portrait",
    weight: taskWeight("portrait"),
    timeoutMs: 4500,
    run: async () => {
      if (!(await whenMatches(".hx-portrait[data-dots]", 4000))) throw new Error("the portrait's dots did not appear");
    },
  });

  // Critical display fonts: the first paint of every section depends on them.
  registerWarmup({
    name: "fonts",
    weight: taskWeight("fonts"),
    timeoutMs: 3000,
    run: async () => {
      if (typeof document === "undefined" || !("fonts" in document)) return;
      await Promise.all([
        document.fonts.load('500 24px "Cormorant Garamond"'),
        document.fonts.load('italic 400 24px "Cormorant Garamond"'),
        document.fonts.load('600 24px "Cormorant Garamond"'),
        document.fonts.load('500 14px "Space Grotesk"'),
        document.fonts.load('700 14px "Space Grotesk"'),
        document.fonts.load('500 14px "Rajdhani"'),
        document.fonts.load('400 12px "Roboto Mono"'),
      ]);
    },
  });

  // The code of every part that is mounted lazily, fetched now instead of when the visitor gets near it: the
  // CV slide of the Horizon, the chat panel, the tubes' component, and
  // Framer Motion's feature bundle (drag, pan, gestures). The "m" components are inert until it has loaded, so
  // without it a motion-driven part of the page (the How I Work ship, its clock) sits at its server-rendered
  // start state until the chunk arrives, which on a slow connection or a busy device is seconds after the
  // visitor gets there.
  registerWarmup({
    name: "chunks",
    weight: taskWeight("chunks"),
    timeoutMs: 6500,
    run: async () => {
      await Promise.all([
        import("../components/motion/features"),
        import("../components/ui/CvTimelineSlide"),
        import("../components/ui/AiChatOverlay"),
        // Lite has no tubes, and should not spend the bytes on their component.
        lite() ? undefined : import("../components/ui/TubesCursor"),
      ]);
    },
  });

  // The certificates, fetched and decoded. They are native-lazy images, so left alone they would arrive as the
  // marquee scrolls into view. The elements themselves are asked to load, which is the one way to be sure the
  // cache entry is the one the page will use (next/image's URL depends on the width and quality it picked).
  registerWarmup({
    name: "images",
    weight: taskWeight("images"),
    timeoutMs: 6000,
    run: async () => {
      if (typeof document === "undefined" || lite()) return null;
      const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
      if (connection?.saveData) return null;
      const images = Array.from(document.querySelectorAll<HTMLImageElement>("#achievements img"));
      await Promise.all(
        images.map((img) => {
          img.loading = "eager";
          return img.decode().catch(() => undefined);
        }),
      );
      return images.length;
    },
  });

  // The shared nebula renderer: create the GL context, compile and link the
  // shader, and force the driver to finish, so the seams never compile on arrival.
  registerWarmup({
    name: "space",
    weight: taskWeight("space"),
    lane: "gpu",
    timeoutMs: 4000,
    run: async () => {
      const { getSpaceRenderer } = await import("./space/SpaceRenderer");
      return getSpaceRenderer().init();
    },
  });

  // The four seams (nebula and accretion, upper and lower halves), each drawn once, so that none of them has a
  // first draw to pay, nor a CSS fallback to swap out, when the visitor scrolls to it.
  registerWarmup({
    name: "seams",
    weight: taskWeight("seams"),
    lane: "gpu",
    timeoutMs: 6000,
    run: async () => {
      const { getSpaceRenderer } = await import("./space/SpaceRenderer");
      return getSpaceRenderer().warmSlots(4, 3500);
    },
  });

  // The Horizon's tube background: its first frame is drawn off screen by the component itself (see
  // lib/tubesWarm.ts), so arriving at the Playground does not pay for pipeline creation. Lite has no tubes.
  registerWarmup({
    name: "tubes",
    weight: taskWeight("tubes"),
    timeoutMs: 5000,
    run: async () => {
      if (typeof document === "undefined" || lite()) return;
      const { whenTubesWarmed } = await import("./tubesWarm");
      await whenTubesWarmed();
    },
  });

  // The Projects plates: WebGL context, shader, texture atlas, the first plates decoded and uploaded, one frame
  // drawn, and then (for a moment, at most) the other plates too. Skipped in Lite mode, which shows a plain grid
  // and should not spend the bandwidth.
  registerWarmup({
    name: "plates",
    weight: taskWeight("plates"),
    lane: "gpu",
    timeoutMs: 6500,
    run: async () => {
      if (typeof document === "undefined" || lite()) return null;
      const started = performance.now();
      const [{ getPlateRenderer }, { projects }] = await Promise.all([
        import("./plates/PlateRenderer"),
        import("@/data/projects"),
      ]);
      const renderer = await getPlateRenderer(projects);
      // The rest of the plates keep streaming after the splash if they are slow: wait for them, but never
      // so long that the task itself runs out of time (the gallery adopts the shared renderer either way).
      const left = Math.max(0, 5800 - (performance.now() - started));
      await Promise.race([renderer.restLoaded, new Promise((r) => setTimeout(r, Math.min(left, 3000)))]);
      return renderer;
    },
  });
}
