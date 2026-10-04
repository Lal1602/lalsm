import { PLATE_FRAG, PLATE_VERT } from "./shaders";
import {
  FRAME,
  SLOTS,
  atlasRows,
  hitPlate,
  plateSize,
  railTarget,
  snapTarget,
  springStep,
  wrapIndex,
  type PlateSize,
} from "./layout";
import { ATLAS_COLS, cellSizeFor, loadCell, pool, type CellSize } from "./atlas";
import { getQualityPreset, onQualityChange } from "@/lib/quality";

/**
 * The Observatory Plates gallery, in one WebGL context and one draw call.
 *
 * It is built to be created *behind the preloader* (lib/warmupTasks.ts): the context
 * is made, the shader compiled and linked, the atlas allocated, the plates nearest
 * the start decoded and uploaded, and a frame drawn, all before the visitor can
 * scroll to it. Arriving at the section is then just `reveal()`: an animation.
 *
 * It only draws when something changes: while the rail moves, while the arrival
 * plays, or on a slow idle tick that keeps the film grain alive (none at all with
 * reduced motion). Off screen or in a hidden tab it does nothing.
 */

export interface PlateSource {
  image: string;
}

const IDLE_MS = 83; // ~12fps: enough for grain, no more
const REVEAL_MS = 1900;
const CRITICAL_TIMEOUT = 3500;
const CLICK_SLOP = 6;

type Uniforms = Record<string, WebGLUniformLocation | null>;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export class PlateRenderer {
  readonly canvas: HTMLCanvasElement;
  /** Called when the plate nearest the centre changes (project index). */
  onFocus?: (index: number) => void;
  /** Called when the centred plate is clicked or activated (project index). */
  onSelect?: (index: number) => void;
  /** Called if the GL context is lost; the page should fall back to its grid. */
  onFail?: () => void;

  failed = false;

  private gl!: WebGLRenderingContext;
  private program!: WebGLProgram;
  private u: Uniforms = {};
  private atlas!: WebGLTexture;
  private cell!: CellSize;
  private atlasW = 0;
  private atlasH = 0;
  private rows = 1;
  private loaded: boolean[] = [];

  private count: number;
  private size: PlateSize;
  private cssW = 1200;
  private cssH = 400;
  private dpr = 1;

  // motion (plate units)
  private pos = 0;
  private vel = 0;
  private target = 0;
  private dragging = false;
  private dragVel = 0;
  private lastX = 0;
  private lastT = 0;
  private downT = 0;
  private moved = 0;
  private leakVel = 0;
  private wheelUntil = 0;
  private hover = -1;
  private lastFocus = -1;

  private reveal = 0;
  private revealing = false;
  private revealStart = 0;

  private visible = false;
  private needs = true;
  private raf = 0;
  private timer = 0;
  private lastNow = 0;
  private lastDraw = 0;
  private reduced = false;

  private host: HTMLElement | null = null;
  private ro: ResizeObserver | null = null;
  private cleanups: Array<() => void> = [];
  private globalCleanups: Array<() => void> = [];

  private constructor(private readonly sources: PlateSource[]) {
    this.count = sources.length;
    this.canvas = document.createElement("canvas");
    this.canvas.className = "plate-canvas";
    this.canvas.setAttribute("aria-hidden", "true");
    this.size = plateSize(this.cssW);
  }

  /**
   * Builds a ready renderer: context, shader, atlas, the first plates, one frame.
   * Rejects if WebGL is unavailable (the caller then shows the DOM grid).
   */
  static async create(sources: PlateSource[]): Promise<PlateRenderer> {
    const r = new PlateRenderer(sources);
    r.initGl();
    await r.loadCritical();
    r.warmFrame();
    // The rest arrive while the visitor is still reading the page above.
    void r.loadRest();
    return r;
  }

  // ── Setup ──────────────────────────────────────────────────────────────────

  private initGl() {
    const gl = this.canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "default",
    });
    if (!gl) throw new Error("WebGL unavailable");
    this.gl = gl;

    const make = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader failed");
      return s;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, make(gl.VERTEX_SHADER, PLATE_VERT));
    gl.attachShader(program, make(gl.FRAGMENT_SHADER, PLATE_FRAG));
    gl.bindAttribLocation(program, 0, "aCorner");
    gl.bindAttribLocation(program, 1, "aInst");
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "link failed");
    this.program = program;
    for (const name of [
      "uCss", "uPlate", "uPitch", "uScroll", "uReveal", "uCount", "uAtlas", "uGrid", "uAtlasPx", "uTime", "uVel", "uHover", "uFrame",
    ]) {
      this.u[name] = gl.getUniformLocation(program, name);
    }

    // SLOTS instances of one quad: (corner.x, corner.y, instance) per vertex.
    const corners = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
    const data = new Float32Array(SLOTS * 6 * 3);
    for (let k = 0; k < SLOTS; k++) {
      for (let v = 0; v < 6; v++) {
        const o = (k * 6 + v) * 3;
        data[o] = corners[v * 2];
        data[o + 1] = corners[v * 2 + 1];
        data[o + 2] = k;
      }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 12, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 12, 8);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // premultiplied
    gl.clearColor(0, 0, 0, 0);

    // The atlas: allocated whole, filled plate by plate.
    this.cell = cellSizeFor(window.innerWidth, gl.getParameter(gl.MAX_TEXTURE_SIZE) as number);
    this.rows = atlasRows(this.count, ATLAS_COLS);
    this.atlasW = this.cell.w * ATLAS_COLS;
    this.atlasH = this.cell.h * this.rows;
    const tex = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.atlasW, this.atlasH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.atlas = tex;

    this.canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      this.failed = true;
      this.stop();
      this.onFail?.();
    });

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reduced = mq.matches;
    const onMq = () => {
      this.reduced = mq.matches;
      this.needs = true;
      this.kick();
    };
    mq.addEventListener("change", onMq);
    const onVis = () => (document.hidden ? this.stop() : this.kick());
    document.addEventListener("visibilitychange", onVis);
    const offQuality = onQualityChange(() => this.resize());
    this.globalCleanups = [
      () => mq.removeEventListener("change", onMq),
      () => document.removeEventListener("visibilitychange", onVis),
      offQuality,
    ];
  }

  private upload(index: number, cell: HTMLCanvasElement) {
    const gl = this.gl;
    if (this.failed) return;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.atlas);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    const col = index % ATLAS_COLS;
    const row = Math.floor(index / ATLAS_COLS);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, col * this.cell.w, row * this.cell.h, gl.RGBA, gl.UNSIGNED_BYTE, cell);
    this.loaded[index] = true;
    this.needs = true;
    this.kick();
  }

  private async loadIndex(i: number) {
    if (this.loaded[i]) return;
    this.upload(i, await loadCell(this.sources[i].image, this.cell));
  }

  /** The plates around the starting position, which must be there before anything is seen. */
  private async loadCritical() {
    const n = this.count;
    const first = [0, 1, 2, n - 1, n - 2].filter((i) => i >= 0 && i < n);
    const all = Promise.all(first.map((i) => this.loadIndex(i).catch(() => undefined)));
    await Promise.race([all, new Promise((r) => setTimeout(r, CRITICAL_TIMEOUT))]);
  }

  /** The remaining plates, nearest to the start first, a few at a time. */
  private async loadRest() {
    const n = this.count;
    const order = Array.from({ length: n }, (_, i) => i)
      .filter((i) => !this.loaded[i])
      .sort((a, b) => Math.min(a, n - a) - Math.min(b, n - b));
    await pool(order, 3, (i) => this.loadIndex(i), undefined);
  }

  /** One real frame at full reveal, so the driver has run the whole pipeline before the first visible one. */
  private warmFrame() {
    const reveal = this.reveal;
    this.reveal = 1;
    this.applySize(1200, 420, 1);
    this.draw(performance.now());
    this.gl.readPixels(0, 0, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array(4));
    this.reveal = reveal;
  }

  // ── Attaching to the page ──────────────────────────────────────────────────

  attach(host: HTMLElement) {
    if (this.host === host) return;
    this.detach();
    this.host = host;
    host.appendChild(this.canvas);

    const c = this.canvas;
    const down = (e: PointerEvent) => this.onDown(e);
    const move = (e: PointerEvent) => this.onMove(e);
    const up = (e: PointerEvent) => this.onUp(e);
    const leave = () => {
      if (this.hover !== -1) {
        this.hover = -1;
        c.style.cursor = "grab";
        this.needs = true;
        this.kick();
      }
    };
    const wheel = (e: WheelEvent) => this.onWheel(e);
    c.addEventListener("pointerdown", down);
    c.addEventListener("pointermove", move);
    c.addEventListener("pointerup", up);
    c.addEventListener("pointercancel", up);
    c.addEventListener("pointerleave", leave);
    c.addEventListener("wheel", wheel, { passive: false });
    this.cleanups = [
      () => c.removeEventListener("pointerdown", down),
      () => c.removeEventListener("pointermove", move),
      () => c.removeEventListener("pointerup", up),
      () => c.removeEventListener("pointercancel", up),
      () => c.removeEventListener("pointerleave", leave),
      () => c.removeEventListener("wheel", wheel),
    ];

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    this.resize();
    c.style.cursor = "grab";
  }

  detach() {
    this.cleanups.forEach((f) => f());
    this.cleanups = [];
    this.ro?.disconnect();
    this.ro = null;
    this.stop();
    this.canvas.remove();
    this.host = null;
  }

  destroy() {
    this.detach();
    this.globalCleanups.forEach((f) => f());
    this.globalCleanups = [];
  }

  /** Plate and stage dimensions (the host's height follows them). */
  get layout(): PlateSize {
    return this.size;
  }

  private resize() {
    if (!this.host || this.failed) return;
    const w = Math.max(240, this.host.clientWidth);
    const cap = Math.min(window.devicePixelRatio || 1, getQualityPreset().dpr, 1.5);
    this.applySize(w, plateSize(w).stageH, cap);
    (this.host.parentElement ?? this.host).style.setProperty("--plate-stage-h", `${this.size.stageH}px`);
    this.needs = true;
    this.kick();
  }

  private applySize(cssW: number, cssH: number, dpr: number) {
    this.cssW = cssW;
    this.cssH = cssH;
    this.dpr = dpr;
    this.size = plateSize(cssW);
    const pw = Math.max(2, Math.round(cssW * dpr));
    const ph = Math.max(2, Math.round(cssH * dpr));
    if (this.canvas.width !== pw || this.canvas.height !== ph) {
      this.canvas.width = pw;
      this.canvas.height = ph;
    }
  }

  // ── Control ────────────────────────────────────────────────────────────────

  setVisible(on: boolean) {
    if (this.visible === on) return;
    this.visible = on;
    if (on) {
      this.needs = true;
      this.kick();
    } else {
      this.stop();
    }
  }

  /** The arrival: plates slide up out of the dark and develop. Plays once. */
  playReveal() {
    if (this.reveal >= 1 || this.revealing) return;
    if (this.reduced) {
      this.reveal = 1;
    } else {
      this.revealing = true;
      this.revealStart = performance.now();
    }
    this.needs = true;
    this.kick();
  }

  get revealed(): boolean {
    return this.reveal >= 1 || this.revealing;
  }

  /** Project index of the plate nearest the centre. */
  focusIndex(): number {
    return wrapIndex(this.pos, this.count);
  }

  goTo(project: number) {
    this.target = railTarget(this.pos, project, this.count);
    if (this.reduced) {
      this.pos = this.target;
      this.vel = 0;
    }
    this.needs = true;
    this.kick();
  }

  step(direction: 1 | -1) {
    this.target = Math.round(this.target) + direction;
    if (this.reduced) {
      this.pos = this.target;
      this.vel = 0;
    }
    this.needs = true;
    this.kick();
  }

  // ── Pointer ────────────────────────────────────────────────────────────────

  private local(e: PointerEvent | WheelEvent) {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  private hit(x: number, y: number) {
    return hitPlate({
      x,
      y,
      stageW: this.cssW,
      stageH: this.cssH,
      pos: this.pos,
      count: this.count,
      plateW: this.size.plateW,
      plateH: this.size.plateH,
      pitch: this.size.pitch,
    });
  }

  private onDown(e: PointerEvent) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    this.canvas.setPointerCapture(e.pointerId);
    this.dragging = true;
    this.lastX = e.clientX;
    this.lastT = this.downT = performance.now();
    this.dragVel = 0;
    this.moved = 0;
    this.vel = 0;
    this.canvas.style.cursor = "grabbing";
    this.kick();
  }

  private onMove(e: PointerEvent) {
    const now = performance.now();
    if (this.dragging) {
      const dx = e.clientX - this.lastX;
      this.lastX = e.clientX;
      this.moved += Math.abs(dx);
      this.pos -= dx / this.size.pitch;
      const dt = Math.max(0.004, (now - this.lastT) / 1000);
      this.lastT = now;
      const inst = Math.max(-14, Math.min(14, -dx / this.size.pitch / dt));
      this.dragVel = this.dragVel * 0.65 + inst * 0.35;
      this.needs = true;
      this.kick();
      return;
    }
    const { x, y } = this.local(e);
    const h = this.hit(x, y);
    const next = h ? h.project : -1;
    if (next !== this.hover) {
      this.hover = next;
      const centred = h && h.project === this.focusIndex();
      this.canvas.style.cursor = centred ? "pointer" : "grab";
      this.needs = true;
      this.kick();
    }
  }

  private onUp(e: PointerEvent) {
    if (!this.dragging) return;
    this.dragging = false;
    if (this.canvas.hasPointerCapture(e.pointerId)) this.canvas.releasePointerCapture(e.pointerId);
    this.canvas.style.cursor = "grab";

    const isClick = this.moved < CLICK_SLOP && performance.now() - this.downT < 500 && e.type === "pointerup";
    if (isClick) {
      const { x, y } = this.local(e);
      const h = this.hit(x, y);
      if (h) {
        if (h.project === this.focusIndex() && Math.abs(this.pos - Math.round(this.pos)) < 0.2) this.onSelect?.(h.project);
        else this.target = h.rail;
      } else {
        this.target = Math.round(this.pos);
      }
      this.vel = 0;
    } else {
      this.vel = this.dragVel;
      this.target = snapTarget(this.pos, this.dragVel);
    }
    this.needs = true;
    this.kick();
  }

  private onWheel(e: WheelEvent) {
    // Only a sideways swipe moves the rail; a normal scroll must still scroll the page.
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    this.pos += e.deltaX / (this.size.pitch * 1.1);
    this.vel = 0;
    this.wheelUntil = performance.now() + 140;
    this.target = Math.round(this.pos);
    this.needs = true;
    this.kick();
  }

  // ── Loop ───────────────────────────────────────────────────────────────────

  private kick() {
    if (this.raf || this.failed || !this.visible || document.hidden) return;
    window.clearTimeout(this.timer);
    this.timer = 0;
    this.lastNow = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  private stop() {
    cancelAnimationFrame(this.raf);
    window.clearTimeout(this.timer);
    this.raf = 0;
    this.timer = 0;
  }

  private frame = (now: number) => {
    this.raf = 0;
    if (!this.visible || document.hidden || this.failed) return;
    const dt = Math.min(0.05, Math.max(0.001, (now - this.lastNow) / 1000));
    this.lastNow = now;
    let active = false;

    if (this.revealing) {
      const t = (now - this.revealStart) / REVEAL_MS;
      this.reveal = easeOutCubic(Math.min(1, t));
      if (t >= 1) {
        this.reveal = 1;
        this.revealing = false;
      } else {
        active = true;
      }
    }

    if (this.dragging) {
      active = true;
    } else if (now >= this.wheelUntil) {
      if (this.reduced) {
        this.pos = this.target;
        this.vel = 0;
      } else {
        const s = springStep(this.pos, this.vel, this.target, dt);
        this.pos = s.pos;
        this.vel = s.vel;
      }
      if (Math.abs(this.vel) > 0.002 || Math.abs(this.pos - this.target) > 0.0008) {
        active = true;
      } else {
        this.pos = this.target;
        this.vel = 0;
      }
    } else {
      active = true;
    }

    const v = this.dragging ? this.dragVel : this.vel;
    this.leakVel += (v - this.leakVel) * Math.min(1, dt * 9);
    if (Math.abs(this.leakVel) > 0.01) active = true;
    else this.leakVel = 0;

    if (active || this.needs || (!this.reduced && now - this.lastDraw >= IDLE_MS - 4)) {
      this.draw(now);
      this.lastDraw = now;
      this.needs = false;
    }

    const focus = wrapIndex(this.pos, this.count);
    if (focus !== this.lastFocus) {
      this.lastFocus = focus;
      this.onFocus?.(focus);
    }

    if (active) {
      this.raf = requestAnimationFrame(this.frame);
    } else if (!this.reduced) {
      // Idle: wake only for the next grain tick.
      this.timer = window.setTimeout(() => {
        this.timer = 0;
        this.kick();
      }, IDLE_MS);
    }
  };

  private draw(now: number) {
    const gl = this.gl;
    if (!gl || this.failed) return;
    const u = this.u;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.atlas);
    gl.uniform1i(u.uAtlas, 0);
    gl.uniform2f(u.uCss, this.cssW, this.cssH);
    gl.uniform2f(u.uPlate, this.size.plateW, this.size.plateH);
    gl.uniform1f(u.uPitch, this.size.pitch);
    gl.uniform1f(u.uScroll, this.pos);
    gl.uniform1f(u.uReveal, this.reveal);
    gl.uniform1f(u.uCount, this.count);
    gl.uniform2f(u.uGrid, ATLAS_COLS, this.rows);
    gl.uniform2f(u.uAtlasPx, this.atlasW, this.atlasH);
    gl.uniform1f(u.uTime, this.reduced ? 12.3 : (now / 1000) % 600);
    gl.uniform1f(u.uVel, this.leakVel);
    gl.uniform1f(u.uHover, this.hover);
    gl.uniform1f(u.uFrame, FRAME);
    gl.drawArrays(gl.TRIANGLES, 0, SLOTS * 6);
  }
}

let shared: Promise<PlateRenderer> | null = null;

/**
 * The one renderer for the page. The preloader's warm-up task calls this first; the
 * section calls it again on mount and gets the same, already finished, instance.
 */
export function getPlateRenderer(sources: PlateSource[]): Promise<PlateRenderer> {
  if (!shared) shared = PlateRenderer.create(sources);
  return shared;
}
