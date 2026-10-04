/**
 * Loading the project pictures into one texture atlas.
 *
 * Every picture is fetched once, decoded off the main thread where the browser
 * allows (createImageBitmap), cropped to the 2:1 cell it will be shown in and
 * handed back as a small canvas ready for texSubImage2D. Doing the crop here, once,
 * means the shader never has to fit or resize anything and every cell is exactly
 * the size it is drawn at.
 */

export const ATLAS_COLS = 4;

export interface CellSize {
  w: number;
  h: number;
}

/** Cell size for this screen: smaller cells on narrow screens save memory and bandwidth. */
export function cellSizeFor(viewportWidth: number, maxTexture: number): CellSize {
  let w = viewportWidth < 700 ? 384 : 512;
  while (w * ATLAS_COLS > maxTexture && w > 128) w = Math.floor(w / 2);
  return { w, h: w / 2 };
}

/** Where a source of `sw x sh` lands in a `cw x ch` cell so that it covers it (object-fit: cover). */
export function coverRect(sw: number, sh: number, cw: number, ch: number) {
  const scale = Math.max(cw / sw, ch / sh);
  const w = sw * scale;
  const h = sh * scale;
  return { dx: (cw - w) / 2, dy: (ch - h) / 2, dw: w, dh: h };
}

/** The optimised copy of a project image (next/image's own endpoint, so it is cached and sized). */
export function plateImageUrl(src: string, width = 640): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;
}

async function decode(url: string): Promise<{ source: CanvasImageSource; w: number; h: number; close?: () => void }> {
  if (typeof createImageBitmap === "function") {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`plate image ${res.status}`);
    const bmp = await createImageBitmap(await res.blob());
    return { source: bmp, w: bmp.width, h: bmp.height, close: () => bmp.close() };
  }
  const img = new Image();
  img.decoding = "async";
  img.src = url;
  await img.decode();
  return { source: img, w: img.naturalWidth, h: img.naturalHeight };
}

/** Fetches `src` and returns it cropped to a cell-sized canvas. */
export async function loadCell(src: string, cell: CellSize): Promise<HTMLCanvasElement> {
  const { source, w, h, close } = await decode(plateImageUrl(src, cell.w >= 512 ? 640 : 384));
  try {
    const canvas = document.createElement("canvas");
    canvas.width = cell.w;
    canvas.height = cell.h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2d context unavailable");
    ctx.imageSmoothingQuality = "high";
    const r = coverRect(w, h, cell.w, cell.h);
    ctx.drawImage(source, r.dx, r.dy, r.dw, r.dh);
    return canvas;
  } finally {
    close?.();
  }
}

/**
 * Runs `worker` over `items` with at most `limit` in flight, in order. Resolves
 * when all have settled; a failed item is passed to `onError` and skipped.
 */
export async function pool<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>,
  onError?: (item: T, error: unknown) => void,
): Promise<void> {
  let next = 0;
  const run = async () => {
    while (next < items.length) {
      const item = items[next++];
      try {
        await worker(item);
      } catch (error) {
        onError?.(item, error);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
}
