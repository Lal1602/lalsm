import { describe, expect, it } from "vitest";
import { parseInline, parseMarkdown, plainText, safeHref } from "@/lib/chat/markdown";

describe("safeHref", () => {
  it("keeps http(s), mailto, anchors and paths on this site", () => {
    for (const ok of ["https://lalsm.vercel.app", "http://example.com/a?b=1", "mailto:a@b.co", "#projects", "/cv", "/projects/mindpoint"]) {
      expect(safeHref(ok), ok).toBe(ok);
    }
  });

  it("drops everything else, however it is dressed", () => {
    for (const bad of ["javascript:alert(1)", "JaVaScRiPt:alert(1)", "data:text/html,<b>x</b>", "vbscript:x", "//evil.example", "ftp://x", "https://a b", "", " java\nscript:alert(1)"]) {
      expect(safeHref(bad), bad).toBeNull();
    }
  });
});

describe("parseInline", () => {
  it("reads bold, italic and code", () => {
    expect(parseInline("a **b** *c* `d`")).toEqual([
      { t: "text", v: "a " },
      { t: "strong", c: [{ t: "text", v: "b" }] },
      { t: "text", v: " " },
      { t: "em", c: [{ t: "text", v: "c" }] },
      { t: "text", v: " " },
      { t: "code", v: "d" },
    ]);
  });

  it("leaves a mark that has not been closed yet as the characters it is", () => {
    expect(parseInline("a **b")).toEqual([{ t: "text", v: "a **b" }]);
    expect(parseInline("a `b")).toEqual([{ t: "text", v: "a `b" }]);
  });

  it("does not turn snake_case or a multiplication into italics", () => {
    expect(parseInline("snake_case_name and 2 * 3 * 4")).toEqual([{ t: "text", v: "snake_case_name and 2 * 3 * 4" }]);
  });

  it("makes a link only of an address it trusts, and shows the words of one it does not", () => {
    expect(parseInline("[cv](/cv)")).toEqual([{ t: "link", href: "/cv", c: [{ t: "text", v: "cv" }] }]);
    const unsafe = parseInline("[click](javascript:alert(1))");
    expect(unsafe.some((n) => n.t === "link")).toBe(false);
    expect(unsafe[0]).toEqual({ t: "text", v: "click" });
  });

  it("links a bare address without its trailing punctuation", () => {
    const nodes = parseInline("lihat https://lalsm.vercel.app, ya");
    expect(nodes[1]).toEqual({ t: "link", href: "https://lalsm.vercel.app", c: [{ t: "text", v: "https://lalsm.vercel.app" }] });
    expect(nodes[2]).toEqual({ t: "text", v: ", ya" });
  });

  it("never produces markup: html in the text is only text", () => {
    expect(parseInline("<img src=x onerror=alert(1)>")).toEqual([{ t: "text", v: "<img src=x onerror=alert(1)>" }]);
  });
});

describe("parseMarkdown", () => {
  it("splits paragraphs on blank lines and keeps the writer's line breaks", () => {
    const blocks = parseMarkdown("satu\ndua\n\ntiga");
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toEqual({ t: "p", c: [{ t: "text", v: "satu" }, { t: "br" }, { t: "text", v: "dua" }] });
  });

  it("reads bulleted and numbered lists, and a heading and a quote", () => {
    const blocks = parseMarkdown("# Judul\n- a\n- b\n\n1. x\n2) y\n\n> kutipan");
    expect(blocks.map((b) => b.t)).toEqual(["h", "ul", "ol", "quote"]);
    expect((blocks[1] as { items: unknown[] }).items).toHaveLength(2);
    expect((blocks[2] as { items: unknown[] }).items).toHaveLength(2);
  });

  it("reads a code block with its language, and keeps its text as it is", () => {
    const [block] = parseMarkdown("```ts\nconst a = **1**;\n  indented\n```");
    expect(block).toEqual({ t: "code", lang: "ts", v: "const a = **1**;\n  indented" });
  });

  it("treats a code block that has not been closed yet as code, so a streaming reply does not flicker", () => {
    expect(parseMarkdown("ini:\n```js\nlet x = 1;")).toEqual([
      { t: "p", c: [{ t: "text", v: "ini:" }] },
      { t: "code", lang: "js", v: "let x = 1;" },
    ]);
  });

  it("is empty for an empty reply", () => {
    expect(parseMarkdown("")).toEqual([]);
    expect(parseMarkdown("  \n \n")).toEqual([]);
  });
});

describe("plainText", () => {
  it("gives the words without the marks, and skips code, for reading aloud", () => {
    expect(plainText("Halo **dunia**, lihat [CV](/cv).\n\n```js\nx()\n```\n\n- satu\n- dua")).toBe("Halo dunia, lihat CV.\nsatu. dua");
  });
});
