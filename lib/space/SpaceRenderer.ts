import { NEBULA_FRAG, NEBULA_VERT } from "./nebula.frag";
import { STARS_FRAG } from "./stars.frag";
import { drawConstellations } from "./constellationArt";
import { getQualityPreset, onQualityChange } from "@/lib/quality";
import { createLens, leaveLens, lensAmplitude, lensNear, moveLens, stepLens, type LensState } from "./lens";

/**
 * One WebGL context that paints every nebula seam.
 *
 * Each seam half is a plain <canvas> in the page (a "slot"). On every draw the
 * renderer makes two passes for each visible slot and hands the result over:
 *
 *   1. the nebula, at a fraction of the screen resolution, into a small texture
 *      (soft gas does not need more, and this is where the GPU time goes);
 *   2. a full-resolution pass that samples that texture and lays the crisp things
 *      on top: star dust, constellations, a rare comet (see stars.frag.ts).
 *
 * One context for all slots, instead of one per canvas, keeps the page inside the
 * browser's context budget and lets it be created and its shaders compiled behind
 * the preloader (see lib/warmup.ts). Both halves of a seam share a clock and sample
 * the same world-space field, so they meet without any matching code.
 *
 * The pointer's push on the gas lives in pass 2 (it moves where pass 1's texture is read), so it can be redrawn
 * by itself at the display's rate while the pointer moves, without re-running the nebula (see lens.ts).
 *
 * Hand-off: with OffscreenCanvas the frame moves as an ImageBitmap into a
 * bitmaprenderer canvas, a GPU texture handoff with no copy and no read-back.
 * Without it the renderer falls back to drawImage onto a 2D canvas, which can
 * force a read-back and is slower.
 */

export type SeamKind = "nebula" | "accretion";

export interface SlotOptions {
  canvas: HTMLCanvasElement;
  kind: SeamKind;
  part: "upper" | "lower";
  /** Slot height in css px (the width is the element's own width). */
  height: number;
  /** Called after the first successful draw so the CSS fallback can step aside. */
  onReady?: () => void;
}

interface ConstTexture {
  tex: WebGLTexture;
  pageWidth: number;
  w: number;
  h: number;
}

interface Slot extends SlotOptions {
  visible: boolean;
  cssWidth: number;
  ready: boolean;
  dirty: boolean;
  /** The slot's constellation artwork as a GL texture, rebuilt on resize. */
  constTex: ConstTexture | null;
  /** The slot's own nebula texture: pass 1's result, which pass 2 reads again on every lens frame. */
  neb: Target | null;
  /** Set around one draw made behind the preloader, before the slot has ever been on screen. */
  warm?: boolean;
}

const KIND = {
  nebula: { palette: 0, band: 150, extent: 330, comet: [0.08, -250, 0.93, 0.37] },
  accretion: { palette: 1, band: 130, extent: 300, comet: [0.58, -200, 0.9, 0.43] },
} as const;

/**
 * The nebula texture is rendered this many css px taller than the slot on both
 * sides, and the crisp pass reads only its middle. Sampling a low-resolution texture
 * right at its edge clamps, which flattens the last texel or two into identical rows;
 * on a seam that gave each half a small stair-step exactly at the join. The pointer's push reads up to about 21 css px
 * beyond where it draws, so the margin is wider than that.
 */
const NEBULA_PAD = 24;

/** Frame the static render freezes on: a pleasing, busy moment of the flow. */
const STATIC_TIME = 43;

interface Target {
  tex: WebGLTexture;
  fbo: WebGLFramebuffer;
  w: number;
  h: number;
}

type Uniforms = Record<string, WebGLUniformLocation | null>;

class SpaceRendererImpl {
  private glCanvas: HTMLCanvasElement | OffscreenCanvas | null = null;
  /** True when frames are handed over as ImageBitmaps (OffscreenCanvas path). */
  private bitmap = false;
  private gl: WebGLRenderingContext | null = null;
  private nebula: WebGLProgram | null = null;
  private crisp: WebGLProgram | null = null;
  private uN: Uniforms = {};
  private uC: Uniforms = {};
  private targets = new Map<string, Target>();
  private slots = new Set<Slot>();
  private failed = false;
  private raf = 0;
  private running = false;
  private animate = true;
  private t0 = 0;
  private lastDraw = 0;
  /** When the page last scrolled. While it is scrolling the nebula's own drift is invisible, so it ticks slowly. */
  private lastScroll = 0;

  private lens: LensState = createLens();
  private lastLens = 0;
  private cleanups: Array<() => void> = [];

  /** Creates the context and compiles both shaders. Safe to call repeatedly. */
  init(): boolean {
    if (this.gl) return true;
    if (this.failed || typeof document === "undefined") return false;

    try {
      const bitmap =
        typeof OffscreenCanvas !== "undefined" && typeof ImageBitmapRenderingContext !== "undefined";
      const canvas: HTMLCanvasElement | OffscreenCanvas = bitmap
        ? new OffscreenCanvas(2, 2)
        : Object.assign(document.createElement("canvas"), { width: 2, height: 2 });
      const gl = canvas.getContext("webgl", {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "default",
      }) as WebGLRenderingContext | null;
      if (!gl) throw new Error("WebGL unavailable");

      this.nebula = this.compile(gl, NEBULA_FRAG);
      this.crisp = this.compile(gl, STARS_FRAG);

      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      // One oversized triangle covers the viewport.
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.disable(gl.BLEND);

      this.uN = this.locate(gl, this.nebula, [
        "uRes", "uCss", "uOrigin", "uWidth", "uTime", "uScroll",
        "uOct", "uPalette", "uBand", "uExtent", "uPx", "uPaper",
      ]);
      this.uC = this.locate(gl, this.crisp, [
        "uNeb", "uRes", "uCss", "uOrigin", "uWidth", "uTime", "uPalette", "uDust", "uMotes",
        "uConst", "uNebMap", "uComet", "uPaper", "uLens", "uLensAmp",
      ]);

      canvas.addEventListener("webglcontextlost", (e) => {
        e.preventDefault();
        this.teardownGl();
      });

      this.glCanvas = canvas;
      this.bitmap = bitmap;
      this.gl = gl;
      this.t0 = performance.now();

      // Force the driver to finish compiling both programs now rather than on the
      // first real frame: one tiny draw each plus a read-back that cannot return
      // until they are done.
      this.probe(gl);
      return true;
    } catch (error) {
      console.warn("[SpaceRenderer] disabled:", error);
      this.failed = true;
      this.teardownGl();
      return false;
    }
  }

  get available(): boolean {
    return !this.failed;
  }

  private compile(gl: WebGLRenderingContext, fragment: string): WebGLProgram {
    const make = (type: number, src: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader) ?? "shader compile failed");
      }
      return shader;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, make(gl.VERTEX_SHADER, NEBULA_VERT));
    gl.attachShader(program, make(gl.FRAGMENT_SHADER, fragment));
    gl.bindAttribLocation(program, 0, "aPos");
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) ?? "program link failed");
    }
    return program;
  }

  private locate(gl: WebGLRenderingContext, program: WebGLProgram, names: string[]): Uniforms {
    const out: Uniforms = {};
    for (const name of names) out[name] = gl.getUniformLocation(program, name);
    return out;
  }

  private probe(gl: WebGLRenderingContext) {
    const target = this.getTarget(gl, 2, 2);
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    gl.viewport(0, 0, 2, 2);
    gl.useProgram(this.nebula);
    const n = this.uN;
    gl.uniform2f(n.uRes, 2, 2);
    gl.uniform2f(n.uCss, 100, 100);
    gl.uniform2f(n.uOrigin, 0, -50);
    gl.uniform1f(n.uWidth, 1000);
    gl.uniform1f(n.uOct, 4);
    gl.uniform1f(n.uBand, 150);
    gl.uniform1f(n.uExtent, 400);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, 2, 2);
    gl.useProgram(this.crisp);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, target.tex);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, target.tex);
    const c = this.uC;
    gl.uniform1i(c.uNeb, 0);
    gl.uniform2f(c.uRes, 2, 2);
    gl.uniform2f(c.uCss, 100, 100);
    gl.uniform1f(c.uWidth, 1000);
    gl.uniform1f(c.uDust, 1);
    gl.uniform1f(c.uMotes, 1);
    gl.uniform1i(c.uConst, 1);
    gl.uniform2f(c.uNebMap, 1, 0);
    gl.uniform4f(c.uComet, 0, 0, 1, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
  }

  /** A render target of exactly this size, reused across frames. */
  private getTarget(gl: WebGLRenderingContext, w: number, h: number): Target {
    const key = `${w}x${h}`;
    const hit = this.targets.get(key);
    if (hit) return hit;

    // Only a handful of sizes ever occur (two seams, a few widths); drop the
    // oldest if a resize storm produces more.
    if (this.targets.size >= 6) {
      const oldest = this.targets.keys().next().value as string;
      const t = this.targets.get(oldest)!;
      gl.deleteTexture(t.tex);
      gl.deleteFramebuffer(t.fbo);
      this.targets.delete(oldest);
    }

    const target = this.makeTarget(gl, w, h);
    this.targets.set(key, target);
    return target;
  }

  private makeTarget(gl: WebGLRenderingContext, w: number, h: number): Target {
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    return { tex, fbo, w, h };
  }

  /** The slot's own nebula target at this size (made, or made again when the size changed). */
  private slotTarget(gl: WebGLRenderingContext, slot: Slot, w: number, h: number): Target {
    if (slot.neb && slot.neb.w === w && slot.neb.h === h) return slot.neb;
    this.freeTarget(gl, slot.neb);
    slot.neb = this.makeTarget(gl, w, h);
    return slot.neb;
  }

  private freeTarget(gl: WebGLRenderingContext | null, t: Target | null) {
    if (!gl || !t) return;
    gl.deleteTexture(t.tex);
    gl.deleteFramebuffer(t.fbo);
  }

  private teardownGl() {
    // Everything that lived in the lost context is gone with it.
    for (const slot of this.slots) {
      slot.neb = null;
      slot.constTex = null;
      slot.dirty = true;
    }
    this.gl = null;
    this.nebula = null;
    this.crisp = null;
    this.glCanvas = null;
    this.targets.clear();
    this.stop();
  }

  /** Whether the nebula should flow (false: render one still frame per slot). */
  setAnimated(on: boolean) {
    if (this.animate === on) return;
    this.animate = on;
    this.slots.forEach((s) => (s.dirty = true));
    this.kick();
  }

  addSlot(options: SlotOptions): { update: (visible: boolean) => void; remove: () => void; invalidate: () => void } {
    const slot: Slot = {
      ...options,
      visible: false,
      cssWidth: options.canvas.parentElement?.clientWidth ?? window.innerWidth,
      ready: false,
      dirty: true,
      constTex: null,
      neb: null,
    };
    this.slots.add(slot);
    this.ensureListeners();

    return {
      update: (visible) => {
        slot.visible = visible;
        if (visible) {
          slot.dirty = true;
          this.kick();
        }
      },
      invalidate: () => {
        slot.cssWidth = slot.canvas.parentElement?.clientWidth ?? window.innerWidth;
        slot.dirty = true;
        this.kick();
      },
      remove: () => {
        this.slots.delete(slot);
        this.freeTarget(this.gl, slot.neb);
        slot.neb = null;
        if (this.slots.size === 0) {
          this.stop();
          this.removeListeners();
        }
      },
    };
  }

  /**
   * Behind the preloader: waits for the seams to mount (they do so after hydration), then draws each one that
   * has never been drawn, once, one per frame. What a first draw costs (the render targets, the constellation
   * texture, the canvas surfaces) is then paid here, and the seam is already `data-ready` when the visitor
   * scrolls to it, instead of showing its CSS fallback for a moment and then swapping. Resolves with how many
   * it drew.
   */
  async warmSlots(expected: number, waitMs: number): Promise<number> {
    const pause = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    const frame = () =>
      new Promise<void>((r) => {
        const t = setTimeout(r, 64);
        requestAnimationFrame(() => {
          clearTimeout(t);
          r();
        });
      });
    const deadline = performance.now() + waitMs;
    while (this.gl && this.slots.size < expected && performance.now() < deadline) await pause(50);
    if (!this.gl) return 0;

    let drawn = 0;
    for (const slot of Array.from(this.slots)) {
      if (slot.ready || !this.slots.has(slot)) continue;
      slot.warm = true;
      const preset = getQualityPreset();
      this.draw(performance.now(), preset.nebulaScale, preset.nebulaOctaves, preset.particles, preset.dpr, true);
      slot.warm = false;
      drawn += 1;
      await frame();
    }
    return drawn;
  }

  private ensureListeners() {
    if (this.cleanups.length > 0) return;
    const onMove = (e: PointerEvent) => {
      // A touch is not a hover: the lens follows a mouse or a pen.
      if (e.pointerType === "touch") return;
      moveLens(this.lens, e.clientX, e.clientY, performance.now());
      this.kick();
    };
    const onLeave = () => leaveLens(this.lens, performance.now());
    // The pointer leaving the window: a mouseout with nowhere to go.
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget) onLeave();
    };
    const onVisibility = () => {
      if (document.hidden) this.stop();
      else this.kick();
    };
    const onScroll = () => {
      this.lastScroll = performance.now();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("mouseout", onOut);
    document.addEventListener("visibilitychange", onVisibility);
    const offQuality = onQualityChange(() => {
      this.slots.forEach((s) => (s.dirty = true));
      this.kick();
    });
    // The theme changes the medium (light on black / ink on paper): every still frame is drawn again.
    const themeWatch = new MutationObserver(() => {
      this.slots.forEach((s) => (s.dirty = true));
      this.kick();
    });
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    this.cleanups = [
      () => window.removeEventListener("pointermove", onMove),
      () => window.removeEventListener("scroll", onScroll),
      () => document.removeEventListener("pointerleave", onLeave),
      () => document.removeEventListener("mouseout", onOut),
      () => document.removeEventListener("visibilitychange", onVisibility),
      offQuality,
      () => themeWatch.disconnect(),
    ];
  }

  private removeListeners() {
    this.cleanups.forEach((c) => c());
    this.cleanups = [];
  }

  private anyVisible() {
    for (const s of this.slots) if (s.visible) return true;
    return false;
  }

  /** Starts the loop if there is something to draw. */
  private kick() {
    if (this.running || !this.gl || document.hidden) return;
    if (!this.anyVisible()) return;
    this.running = true;
    this.raf = requestAnimationFrame(this.frame);
  }

  private stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private frame = (now: number) => {
    if (!this.running) return;

    const preset = getQualityPreset();
    // The lens is advanced on every frame (it is a few multiplications); whether it is worth a frame of its own is
    // what it reports.
    const lensActive = this.animate && stepLens(this.lens, now);

    // While the page is being scrolled the cloud's own slow drift cannot be seen against the
    // motion of everything else, and a draw costs a GPU pass on the very frames that are
    // already busy compositing the scroll: tick at a fifth of a second until it settles.
    const scrolling = now - this.lastScroll < 140;
    const minGap = (scrolling ? 200 : 1000 / preset.idleFps) - 2;
    // A slot that has just scrolled into view and was never drawn must not wait: it would be blank.
    let fresh = false;
    for (const s of this.slots) if (s.dirty && s.visible) fresh = true;
    if (fresh || now - this.lastDraw >= minGap) {
      // The slow tick: the nebula itself, and the lens with it.
      this.lastDraw = now;
      this.lastLens = now;
      this.draw(now, preset.nebulaScale, preset.nebulaOctaves, preset.particles, preset.dpr, true);
    } else if (lensActive && !scrolling && now - this.lastLens >= 1000 / preset.lensFps - 2) {
      // Between slow ticks, while the pointer is moving over a seam: only the cheap pass, on the nebula as it was drawn.
      this.lastLens = now;
      this.draw(now, preset.nebulaScale, preset.nebulaOctaves, preset.particles, preset.dpr, false);
    }

    // Keep ticking while something is visible and either flowing or settling.
    let needsMore = false;
    if (this.animate && this.anyVisible()) needsMore = true;
    else if (!this.animate) for (const s of this.slots) if (s.dirty && s.visible) needsMore = true;

    if (needsMore && !document.hidden) this.raf = requestAnimationFrame(this.frame);
    else this.running = false;
  };

  /** The slot's constellations as a texture: painted once per size, then just sampled. */
  private constellationTexture(
    gl: WebGLRenderingContext,
    slot: Slot,
    pageWidth: number,
    cssW: number,
    cssH: number,
    originY: number,
    scale: number,
  ): WebGLTexture {
    const w = Math.max(2, Math.round(cssW * scale));
    const h = Math.max(2, Math.round(cssH * scale));
    const hit = slot.constTex;
    if (hit && hit.pageWidth === pageWidth && hit.w === w && hit.h === h) return hit.tex;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(w / cssW, h / cssH);
      drawConstellations(ctx, { w: cssW, h: cssH, originY, kind: slot.kind });
    }

    const tex = hit?.tex ?? gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    slot.constTex = { tex, pageWidth, w, h };
    return tex;
  }

  /**
   * One round of painting. `full`: the nebula pass runs again (it is the expensive one); otherwise only the crisp pass
   * runs, on each slot's nebula as it was last drawn, and only in the slots the lens can reach.
   */
  private draw(now: number, scale: number, octaves: number, particles: number, dprCap: number, full: boolean) {
    const gl = this.gl;
    const glCanvas = this.glCanvas;
    if (!gl || !glCanvas) return;

    const time = this.animate ? (now - this.t0) / 1000 : STATIC_TIME;
    // The still frame must not depend on where the page happens to be scrolled:
    // each half is drawn when it first comes into view, and two halves drawn at
    // different scroll positions would not meet at the seam.
    const scrollY = this.animate ? window.scrollY : 0;
    const pageWidth = Math.max(window.innerWidth, document.documentElement.clientWidth);
    // Full-resolution output: the crisp pass is cheap, so it may use more pixels
    // than the nebula, but never more than the screen can show.
    // The crisp layer is stars and hairlines; 1.25x is plenty and 1x on weaker tiers.
    const outScale = Math.min(window.devicePixelRatio || 1, dprCap >= 1.5 ? 1.25 : 1);
    const paper = document.documentElement.getAttribute("data-theme") === "light" ? 1 : 0;
    const amp = lensAmplitude(pageWidth);
    const lens = this.lens;
    const n = this.uN;
    const c = this.uC;

    for (const slot of this.slots) {
      if (!slot.visible && !slot.warm) continue;
      if (!this.animate && !slot.dirty) continue;

      const cfg = KIND[slot.kind];
      const cssW = Math.max(2, slot.cssWidth);
      const cssH = slot.height;
      const w1 = Math.max(2, Math.round(cssW * scale));
      const cssHx = cssH + NEBULA_PAD * 2;
      const h1 = Math.max(2, Math.round(cssHx * scale));
      const w2 = Math.max(2, Math.round(cssW * outScale));
      const h2 = Math.max(2, Math.round(cssH * outScale));

      // Seam line is at world y = 0. The upper half sits above it, the lower below.
      const originY = slot.part === "upper" ? -cssH : 0;
      const rect = slot.canvas.getBoundingClientRect();
      // Where the pointer's push reaches this slot (and how strongly); in the slot's own css px.
      const reaches = this.animate && lens.amount > 0 && lensNear(rect, lens.x, lens.y);

      // A lens-only frame touches only the slots the lens reaches, and only if their nebula is there to read.
      const nebulaPass = full || !slot.neb || slot.neb.w !== w1 || slot.neb.h !== h1;
      if (!nebulaPass && (!reaches || slot.dirty || !slot.ready)) continue;

      // ── Pass 1: the nebula, small ──
      let target = slot.neb;
      if (nebulaPass) {
        target = this.slotTarget(gl, slot, w1, h1);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        gl.viewport(0, 0, w1, h1);
        gl.useProgram(this.nebula);
        gl.uniform2f(n.uRes, w1, h1);
        gl.uniform2f(n.uCss, cssW, cssHx);
        gl.uniform2f(n.uOrigin, 0, originY - NEBULA_PAD);
        gl.uniform1f(n.uWidth, pageWidth);
        gl.uniform1f(n.uTime, time);
        gl.uniform1f(n.uScroll, scrollY);
        gl.uniform1f(n.uOct, octaves);
        gl.uniform1f(n.uPalette, cfg.palette);
        gl.uniform1f(n.uBand, cfg.band);
        gl.uniform1f(n.uExtent, cfg.extent);
        gl.uniform1f(n.uPx, cssW / w1);
        gl.uniform1f(n.uPaper, paper);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      if (!target) continue;

      // ── Pass 2: crisp layer at full size, straight into the output surface ──
      if (glCanvas.width !== w2 || glCanvas.height !== h2) {
        glCanvas.width = w2;
        glCanvas.height = h2;
      }
      const constTex = this.constellationTexture(gl, slot, pageWidth, cssW, cssH, originY, outScale);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, w2, h2);
      gl.useProgram(this.crisp);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, target.tex);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, constTex);
      gl.uniform1i(c.uNeb, 0);
      gl.uniform1i(c.uConst, 1);
      gl.uniform2f(c.uNebMap, cssH / cssHx, NEBULA_PAD / cssHx);
      gl.uniform2f(c.uRes, w2, h2);
      gl.uniform2f(c.uCss, cssW, cssH);
      gl.uniform2f(c.uOrigin, 0, originY);
      gl.uniform1f(c.uWidth, pageWidth);
      gl.uniform1f(c.uTime, time);
      gl.uniform1f(c.uPalette, cfg.palette);
      gl.uniform1f(c.uDust, particles);
      gl.uniform1f(c.uMotes, particles >= 0.8 ? 1 : 0);
      gl.uniform4f(c.uComet, cfg.comet[0] * pageWidth, cfg.comet[1], cfg.comet[2], cfg.comet[3]);
      gl.uniform1f(c.uPaper, paper);
      gl.uniform2f(c.uLens, lens.x - rect.left, lens.y - rect.top);
      gl.uniform2f(c.uLensAmp, reaches ? amp.x * lens.amount : 0, reaches ? amp.y * lens.amount : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (this.bitmap) {
        const out = slot.canvas.getContext("bitmaprenderer");
        if (!out) continue;
        out.transferFromImageBitmap((glCanvas as OffscreenCanvas).transferToImageBitmap());
      } else {
        if (slot.canvas.width !== w2 || slot.canvas.height !== h2) {
          slot.canvas.width = w2;
          slot.canvas.height = h2;
        }
        const ctx = slot.canvas.getContext("2d");
        if (!ctx) continue;
        ctx.clearRect(0, 0, w2, h2);
        ctx.drawImage(glCanvas as HTMLCanvasElement, 0, 0);
      }

      if (nebulaPass) slot.dirty = false;
      if (!slot.ready) {
        slot.ready = true;
        slot.onReady?.();
      }
    }
  }
}

let instance: SpaceRendererImpl | null = null;

export function getSpaceRenderer(): SpaceRendererImpl {
  if (!instance) instance = new SpaceRendererImpl();
  return instance;
}

export type SpaceRenderer = SpaceRendererImpl;
