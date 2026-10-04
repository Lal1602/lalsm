import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { NOON_PAPER, toHex } from "@/lib/paperSun";

/**
 * The light theme's tokens, read from the stylesheet that defines them: the paper it prints on and the
 * inks it prints with. These are the numbers the design rests on, so they are held here: no white, ink
 * that reads on every step of the paper, accents that read as text, and the script's noon equal to the CSS.
 */
const css = readFileSync("app/styles/C0-nav-and-theme.css", "utf8").replace(/\r\n/g, "\n");
const block = /html\[data-theme="light"\] \{\n  color-scheme: light;([\s\S]*?)\n\}/.exec(css)?.[1] ?? "";
const token = (name: string) => new RegExp(`--${name}: (#[0-9a-f]{6});`).exec(block)?.[1] ?? "";

const lin = (c: number) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const lum = (h: string) => {
  const n = parseInt(h.slice(1), 16);
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe("the light theme's tokens", () => {
  it("are all there", () => {
    expect(block.length).toBeGreaterThan(200);
    for (const n of ["p0", "p1", "p2", "p3", "ink", "ink-2", "teal", "violet", "amber", "rust"]) expect(token(n), n).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("paper is never white: the lightest surface is well under the old theme's #F9F9FB (0.95)", () => {
    expect(lum(token("p0"))).toBeLessThan(0.84);
    expect(lum(token("p1"))).toBeLessThan(0.76);
  });

  it("paper steps down: raised, page, sunken, deep", () => {
    const l = ["p0", "p1", "p2", "p3"].map((n) => lum(token(n)));
    for (let i = 1; i < l.length; i++) expect(l[i]).toBeLessThan(l[i - 1]);
  });

  it("the script's noon paper is the stylesheet's paper", () => {
    ["p0", "p1", "p2", "p3"].forEach((n, i) => expect(toHex(NOON_PAPER[i])).toBe(token(n)));
  });

  it("the rgb triples match the hex values", () => {
    for (const n of ["p0", "p1", "p2", "p3", "ink", "ink-2", "teal", "violet", "amber", "rust"]) {
      const hex = token(n);
      const triple = new RegExp(`--${n}-rgb: (\\d+), (\\d+), (\\d+);`).exec(block);
      expect(triple, n).not.toBeNull();
      const v = parseInt(hex.slice(1), 16);
      expect([Number(triple![1]), Number(triple![2]), Number(triple![3])], n).toEqual([(v >> 16) & 255, (v >> 8) & 255, v & 255]);
    }
  });

  it("ink reads on every step of the paper, and the second ink does too", () => {
    for (const p of ["p0", "p1", "p2", "p3"]) {
      expect(contrast(token("ink"), token(p)), `ink on ${p}`).toBeGreaterThan(9);
      expect(contrast(token("ink-2"), token(p)), `ink-2 on ${p}`).toBeGreaterThanOrEqual(5);
    }
  });

  it("the accents are usable as text on the page and on raised paper", () => {
    for (const a of ["teal", "violet", "amber", "rust"]) {
      for (const p of ["p0", "p1"]) expect(contrast(token(a), token(p)), `${a} on ${p}`).toBeGreaterThanOrEqual(4.5);
    }
  });
});
