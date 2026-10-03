import { describe, expect, it } from "vitest";
import { extractActions, stripActionTagsForDisplay } from "@/lib/chat/actions";

describe("extractActions", () => {
  it("pulls out scroll, project and achievement tags and removes them from the text", () => {
    const { text, actions } = extractActions(
      "Siap! [ACTION:SCROLL_AND_HIGHLIGHT:projects] Ini dia. [ACTION:OPEN_PROJECT:MindPoint] [ACTION:OPEN_ACHIEVEMENT:TOEIC Listening]",
    );
    expect(text).not.toContain("[ACTION");
    expect(text.startsWith("Siap!")).toBe(true);
    expect(actions).toEqual([
      { type: "scroll", sectionId: "projects" },
      { type: "project", title: "MindPoint" },
      { type: "achievement", title: "TOEIC Listening" },
    ]);
  });

  it("ignores unknown section ids and unknown action kinds", () => {
    const { actions, text } = extractActions("x [ACTION:SCROLL_AND_HIGHLIGHT:admin] [ACTION:DELETE_EVERYTHING:now]");
    expect(actions).toEqual([]);
    expect(text).toBe("x");
  });

  it("is case-insensitive about the tag name and the section id", () => {
    const { actions } = extractActions("[action:scroll_and_highlight:CONTACT]");
    expect(actions).toEqual([{ type: "scroll", sectionId: "contact" }]);
  });
});

describe("stripActionTagsForDisplay", () => {
  it("hides complete tags", () => {
    expect(stripActionTagsForDisplay("Halo [ACTION:OPEN_PROJECT:Snake Game] dunia")).toBe("Halo  dunia");
  });

  it("hides a half-received tag at the end of the stream", () => {
    expect(stripActionTagsForDisplay("Halo [ACTION:SCROLL_AND_HIGH")).toBe("Halo");
    expect(stripActionTagsForDisplay("Halo [ACT")).toBe("Halo");
    expect(stripActionTagsForDisplay("Halo [")).toBe("Halo");
  });

  it("leaves ordinary brackets alone", () => {
    expect(stripActionTagsForDisplay("pakai array [1, 2] ya")).toBe("pakai array [1, 2] ya");
  });
});
