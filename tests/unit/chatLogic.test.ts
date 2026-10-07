import { describe, expect, it } from "vitest";
import { achievements } from "@/data/achievements";
import { projects } from "@/data/projects";
import { SECTION_IDS } from "@/lib/chat/actions";
import { cardsFromActions, MAX_CARDS } from "@/lib/chat/cards";
import { COMMANDS, matchCommands, parseCommand } from "@/lib/chat/commands";
import { COPY, CHAT_LANGS, defaultChatLang } from "@/lib/chat/copy";
import { SECTION_LABELS, isSectionId, sectionAt, suggestionsFor } from "@/lib/chat/context";
import { transcriptFileName, transcriptMarkdown } from "@/lib/chat/export";
import { buildSystemInstruction, SYSTEM_INSTRUCTION } from "@/lib/chat/prompt";
import { TOUR_LENGTH, tourStep, tourStops } from "@/lib/chat/tour";
import { toneInstruction, tonify } from "@/lib/chat/tone";
import { parseSuggestion, newMessageId, type Message } from "@/lib/chat/types";

describe("slash commands", () => {
  it("reads a line that is exactly a command, with its argument, by name or alias", () => {
    expect(parseCommand("/cv")?.command.id).toBe("cv");
    expect(parseCommand("  /RESUME ")?.command.id).toBe("cv");
    expect(parseCommand("/tone bro")).toMatchObject({ command: { id: "tone" }, args: "bro" });
    expect(parseCommand("/proyek")?.command.id).toBe("projects");
    expect(parseCommand("/?")?.command.id).toBe("help");
  });

  it("does not take a sentence, an unknown word or a path for a command", () => {
    for (const text of ["cv", "tolong /cv", "/nope", "/", "https://x.co/cv", "/ cv"]) expect(parseCommand(text), text).toBeNull();
  });

  it("lists the commands a half-typed line matches, and none once an argument is being typed", () => {
    expect(matchCommands("/")).toHaveLength(COMMANDS.length);
    expect(matchCommands("/proj").map((c) => c.id)).toEqual(["projects"]);
    // By name or by alias: skills, and certificates through "sertifikat".
    expect(matchCommands("/s").map((c) => c.id)).toEqual(expect.arrayContaining(["skills", "certificates"]));
    expect(matchCommands("/tone b")).toEqual([]);
    expect(matchCommands("halo")).toEqual([]);
  });

  it("gives every command a hint in both languages and a name that is unique", () => {
    expect(new Set(COMMANDS.map((c) => c.name)).size).toBe(COMMANDS.length);
    for (const c of COMMANDS) for (const lang of CHAT_LANGS) expect(c.hint[lang].length, `${c.name} ${lang}`).toBeGreaterThan(3);
  });
});

describe("cards under a reply", () => {
  it("makes a card of a project that exists, from the archive's own data, and none of one that does not", () => {
    const real = projects[0].title;
    const cards = cardsFromActions([
      { type: "project", title: real },
      { type: "project", title: "A project nobody made" },
    ]);
    expect(cards).toHaveLength(1);
    expect(cards[0]).toMatchObject({ kind: "project", title: real, image: projects[0].image });
  });

  it("makes a card of a certificate by a part of its title", () => {
    const [card] = cardsFromActions([{ type: "achievement", title: "toeic" }]);
    expect(card).toMatchObject({ kind: "achievement" });
    expect((card as { title: string }).title).toContain("TOEIC");
    expect(achievements.some((a) => a.title === (card as { title: string }).title)).toBe(true);
  });

  it("offers the CV, and a section only when nothing in it was named", () => {
    expect(cardsFromActions([{ type: "cv" }])).toEqual([{ kind: "cv" }]);
    expect(cardsFromActions([{ type: "scroll", sectionId: "projects" }])).toEqual([{ kind: "section", id: "projects" }]);
    expect(cardsFromActions([{ type: "scroll", sectionId: "home" }])).toEqual([]);
    const named = cardsFromActions([{ type: "scroll", sectionId: "projects" }, { type: "project", title: projects[0].title }]);
    expect(named).toHaveLength(1);
    expect(named[0].kind).toBe("project");
  });

  it("does not repeat a card and never shows more than the cap", () => {
    const many = cardsFromActions(projects.slice(0, 6).flatMap((p) => [{ type: "project" as const, title: p.title }, { type: "project" as const, title: p.title }]));
    expect(many.length).toBeLessThanOrEqual(MAX_CARDS);
    expect(new Set(many.map((c) => (c as { title: string }).title)).size).toBe(many.length);
  });
});

describe("where the visitor is", () => {
  it("knows every section the assistant can point at, in both languages", () => {
    for (const id of SECTION_IDS) {
      expect(isSectionId(id)).toBe(true);
      for (const lang of CHAT_LANGS) {
        expect(SECTION_LABELS[id][lang]).toBeTruthy();
        expect(suggestionsFor(id, lang)).toHaveLength(3);
      }
    }
    expect(isSectionId("admin")).toBe(false);
    expect(suggestionsFor(null, "en")).toEqual(suggestionsFor("home", "en"));
  });

  it("picks the section under the middle of the window, the innermost when they nest, null over a gap", () => {
    const rects = [
      { id: "home" as const, top: -800, bottom: 100 },
      { id: "about" as const, top: 100, bottom: 900 },
      { id: "projects" as const, top: 300, bottom: 500 },
    ];
    expect(sectionAt(rects, 50)).toBe("home");
    expect(sectionAt(rects, 200)).toBe("about");
    expect(sectionAt(rects, 400)).toBe("projects");
    expect(sectionAt(rects, 5000)).toBeNull();
  });
});

describe("the tour", () => {
  it("has a stop for each section it names, each with a true, non-empty line in both languages", () => {
    for (const lang of CHAT_LANGS) {
      const stops = tourStops(lang);
      expect(stops).toHaveLength(TOUR_LENGTH);
      for (const s of stops) {
        expect(isSectionId(s.section)).toBe(true);
        expect(s.text.length).toBeGreaterThan(40);
      }
    }
    expect(tourStops("en").find((s) => s.section === "projects")?.text).toContain(String(projects.length));
    expect(tourStops("en").find((s) => s.section === "achievements")?.text).toContain(String(achievements.length));
  });

  it("offers Next until the last stop, which offers the CV, and nothing after it", () => {
    expect(tourStep(0, "en")?.chips.map((c) => c.command)).toEqual(["/tour next", "/tour stop"]);
    const last = tourStep(TOUR_LENGTH - 1, "id");
    expect(last?.last).toBe(true);
    expect(last?.chips.map((c) => c.command)).toEqual(["/cv", "/tour stop"]);
    expect(tourStep(TOUR_LENGTH, "en")).toBeNull();
  });
});

describe("the interface's words", () => {
  it("has every string in both languages, the same shape", () => {
    expect(Object.keys(COPY.id).sort()).toEqual(Object.keys(COPY.en).sort());
    expect(COPY.id.quick.map((q) => q.id)).toEqual(COPY.en.quick.map((q) => q.id));
    for (const lang of CHAT_LANGS) expect(COPY[lang].suggestions).toHaveLength(4);
  });

  it("starts in Indonesian for an Indonesian browser and in English for any other", () => {
    expect(defaultChatLang(["id-ID", "en"])).toBe("id");
    expect(defaultChatLang(["id"])).toBe("id");
    expect(defaultChatLang(["en-US"])).toBe("en");
    expect(defaultChatLang(["de-DE"])).toBe("en");
    expect(defaultChatLang(undefined)).toBe("en");
  });

  it("says Live or offline and never names the model behind it", () => {
    expect(COPY.en.statusLive).toBe("Live");
    expect(COPY.id.statusLive).toBe("Live");
    expect(JSON.stringify(COPY)).not.toMatch(/gemini/i);
  });
});

describe("suggestions", () => {
  it("splits a tone tag off the words, and passes a command chip through", () => {
    expect(parseSuggestion("[Penasaran] Proyek mana yang paling rumit?")).toEqual({ tag: "Penasaran", text: "Proyek mana yang paling rumit?" });
    expect(parseSuggestion("Tanpa tag")).toEqual({ text: "Tanpa tag" });
    expect(parseSuggestion({ label: "Unduh CV", command: "/cv" })).toEqual({ text: "Unduh CV", command: "/cv" });
  });

  it("makes ids that do not repeat", () => {
    expect(new Set(Array.from({ length: 200 }, newMessageId)).size).toBe(200);
  });
});

describe("the prompt", () => {
  it("is the base alone with no context, and adds the tone and the section when there are some", () => {
    expect(buildSystemInstruction()).toBe(SYSTEM_INSTRUCTION);
    const text = buildSystemInstruction({ tone: "bro", section: "projects" });
    expect(text.startsWith(SYSTEM_INSTRUCTION)).toBe(true);
    expect(text).toContain("ACT_LIKE_BRO");
    expect(text).toContain("bagian Projects");
    expect(toneInstruction("default")).toBe("");
  });

  it("knows the CV action and says the CV's facts, from the CV's own data", () => {
    expect(SYSTEM_INSTRUCTION).toContain("[ACTION:OPEN_CV]");
    expect(SYSTEM_INSTRUCTION).toContain("Sign Language Recognition System");
    expect(SYSTEM_INSTRUCTION).not.toMatch(/GDGoC|3125500052/);
  });
});

describe("tone on the offline answers", () => {
  it("dresses a reply and leaves the default alone, keeping an action tag intact", () => {
    const base = "Ini galerinya. [ACTION:SCROLL_AND_HIGHLIGHT:projects]";
    expect(tonify(base, "default")).toBe(base);
    expect(tonify(base, undefined)).toBe(base);
    expect(tonify(base, "bro")).toContain("[ACTION:SCROLL_AND_HIGHLIGHT:projects]");
    expect(tonify(base, "sensei")).toContain("[ACTION:SCROLL_AND_HIGHLIGHT:projects]");
    expect(tonify(base, "bro")).not.toBe(base);
  });
});

describe("the exported conversation", () => {
  const messages: Message[] = [
    { id: "1", role: "user", ts: Date.UTC(2026, 9, 7, 3, 0), text: "Halo" },
    { id: "2", role: "ai", ts: Date.UTC(2026, 9, 7, 3, 1), text: "Hai! **Selamat datang.**" },
    { id: "3", role: "ai", ts: Date.UTC(2026, 9, 7, 3, 2), text: "belum selesai", streaming: true },
  ];

  it("lists the turns with who and when (Jakarta time), and leaves out a reply still arriving", () => {
    const md = transcriptMarkdown(messages, { lang: "en", when: new Date(Date.UTC(2026, 9, 7, 3, 5)) });
    expect(md).toContain("# Conversation with B.I.L.A.L.");
    expect(md).toContain("**You** · 10:00 WIB");
    expect(md).toContain("**B.I.L.A.L.** · 10:01 WIB");
    expect(md).toContain("Hai! **Selamat datang.**");
    expect(md).not.toContain("belum selesai");
  });

  it("says so when there is nothing yet, and names the file by the date", () => {
    expect(transcriptMarkdown([], { lang: "id", when: new Date() })).toContain("belum ada pesan");
    expect(transcriptFileName(new Date(Date.UTC(2026, 9, 7)))).toBe("bilal-chat-2026-10-07.md");
  });
});
