import { describe, expect, it } from "vitest";
import { SUGGESTIONS_DELIMITER } from "@/lib/chat/prompt";
import { createReplySplitter, parseModelOutput, parseSuggestions } from "@/lib/chat/stream";

function feed(chunks: string[]) {
  const splitter = createReplySplitter();
  const visible = chunks.map((c) => splitter.push(c)).join("");
  return { visible, ...splitter.finish() };
}

describe("createReplySplitter", () => {
  it("streams the reply and never leaks the delimiter or suggestions", () => {
    const { visible, reply, suggestions } = feed([
      "Halo dun",
      "ia!\n",
      `${SUGGESTIONS_DELIMITER}\n`,
      '["[Santai] a", "[Serius] b", "[Penasaran] c"]',
    ]);
    expect(visible.trim()).toBe("Halo dunia!");
    expect(reply).toBe("Halo dunia!");
    expect(suggestions).toEqual(["[Santai] a", "[Serius] b", "[Penasaran] c"]);
  });

  it("handles a delimiter split across chunks", () => {
    const half = Math.floor(SUGGESTIONS_DELIMITER.length / 2);
    const { visible, reply, suggestions } = feed([
      "Jawaban",
      `\n${SUGGESTIONS_DELIMITER.slice(0, half)}`,
      `${SUGGESTIONS_DELIMITER.slice(half)}\n["x"]`,
    ]);
    expect(visible).not.toContain("<<<");
    expect(visible).not.toContain("SUGG");
    expect(reply).toBe("Jawaban");
    expect(suggestions).toEqual(["x"]);
  });

  it("releases a held-back '<' that turns out to be ordinary text", () => {
    const { visible } = feed(["a < b", " dan c < d"]);
    expect(visible).toBe("a < b dan c < d");
  });

  it("copes with a model that never emits the delimiter", () => {
    const { reply, suggestions } = feed(["hanya teks"]);
    expect(reply).toBe("hanya teks");
    expect(suggestions).toEqual([]);
  });
});

describe("parseSuggestions", () => {
  it("returns at most three clean strings", () => {
    expect(parseSuggestions('["a", "", "b", 3, "c", "d"]')).toEqual(["a", "b", "c"]);
  });

  it("survives malformed JSON", () => {
    expect(parseSuggestions('["oops", ')).toEqual([]);
    expect(parseSuggestions("tidak ada array")).toEqual([]);
  });
});

describe("parseModelOutput", () => {
  it("splits a complete output", () => {
    expect(parseModelOutput(`Hi\n${SUGGESTIONS_DELIMITER}\n["x"]`)).toEqual({ reply: "Hi", suggestions: ["x"] });
  });
});
