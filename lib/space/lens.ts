/**
 * The pointer's push on the nebula, as pure state.
 *
 * The gas leans away from the pointer (a soft lens, about 130 px across). It used to be a term inside the nebula
 * shader, so every update of the lens meant redrawing the whole cloud, which the renderer does only a dozen times
 * a second (its drift needs no more): the lens stepped at that rate and trailed the hand. Now the lens is applied
 * where the cloud is read, in the cheap full-resolution pass (see stars.frag.ts), so it can be redrawn on its own at
 * the display's rate while the pointer is moving, and the cloud underneath is not touched.
 *
 * This file is the part that has no GL in it: where the lens is (it follows the pointer with a short ease, so a
 * mouse that reports every 8 ms or every 16 ms looks the same), how strong it is (up while the pointer moves,
 * fading slowly once it rests, quickly once it leaves), and whether it is moving enough to be worth a frame of its
 * own. All of it is in milliseconds, so none of it depends on the frame rate.
 */

/** How the lens trails the pointer (time constant). */
export const FOLLOW_MS = 55;
/** How quickly it comes up while the pointer moves. */
export const RISE_MS = 110;
/** The pointer has rested after this long without moving; the lens then starts to fade. */
export const REST_MS = 300;
/** How slowly it fades while the pointer rests on the page. */
export const FADE_MS = 1600;
/** How quickly it fades once the pointer has left the window. */
export const LEAVE_MS = 330;
/** After the pointer last moved, the lens is redrawn on its own for this long (the part of the fade you can see). */
export const ACTIVE_MS = 1500;

/** Beyond this distance (css px) from a slot the lens cannot be seen in it (its push there is under a pixel). */
export const REACH = 330;
/** The lens' width: exp(-d^2 / SIGMA2). */
export const SIGMA2 = 32000;

/** The push at the pointer (css px) for a page this wide: the old shader's 0.07 of noise space, in pixels. */
export function lensAmplitude(pageWidth: number): { x: number; y: number } {
  const k = Math.min(2.4, Math.max(1, 1440 / pageWidth));
  return { x: 0.07 / (0.0022 * k), y: 0.07 / (0.0034 * k) };
}

export interface LensState {
  /** Where the lens is (eased), client px. */
  x: number;
  y: number;
  /** Where the pointer is. */
  tx: number;
  ty: number;
  /** 0..1 */
  amount: number;
  seen: boolean;
  lastMove: number;
  left: boolean;
  lastStep: number;
}

export function createLens(): LensState {
  return { x: 0, y: 0, tx: 0, ty: 0, amount: 0, seen: false, lastMove: -1e9, left: false, lastStep: 0 };
}

export function moveLens(s: LensState, x: number, y: number, now: number): void {
  s.tx = x;
  s.ty = y;
  s.lastMove = now;
  s.left = false;
  if (!s.seen) {
    // The first sighting of the pointer: the lens starts under it, it does not fly in from the corner.
    s.seen = true;
    s.x = x;
    s.y = y;
  }
}

export function leaveLens(s: LensState, now: number): void {
  s.left = true;
  s.lastMove = Math.min(s.lastMove, now - REST_MS);
}

const ease = (dt: number, tau: number) => 1 - Math.exp(-dt / tau);

/**
 * Advances the lens to `now`. Returns whether it is moving enough to be worth a frame of its own (the pointer is moving
 * or just stopped, the lens has not yet caught up, or it is leaving); when it is not, the renderer's own slow tick
 * keeps the (nearly still) lens current.
 */
export function stepLens(s: LensState, now: number): boolean {
  const dt = Math.min(100, Math.max(0, now - (s.lastStep || now)));
  s.lastStep = now;
  if (!s.seen) return false;

  const moving = now - s.lastMove < REST_MS && !s.left;
  const follow = ease(dt, FOLLOW_MS);
  s.x += (s.tx - s.x) * follow;
  s.y += (s.ty - s.y) * follow;

  if (moving) s.amount += (1 - s.amount) * ease(dt, RISE_MS);
  else s.amount *= Math.exp(-dt / (s.left ? LEAVE_MS : FADE_MS));
  if (s.amount < 0.002) s.amount = 0;

  const catching = Math.abs(s.tx - s.x) + Math.abs(s.ty - s.y) > 0.4;
  const recent = now - s.lastMove < ACTIVE_MS;
  return s.amount > 0 && (recent || s.left || catching);
}

/** Whether a slot (its client rect) is near enough to the lens for it to show in it. */
export function lensNear(rect: { left: number; right: number; top: number; bottom: number }, x: number, y: number): boolean {
  const dx = Math.max(rect.left - x, 0, x - rect.right);
  const dy = Math.max(rect.top - y, 0, y - rect.bottom);
  return dx * dx + dy * dy < REACH * REACH;
}
