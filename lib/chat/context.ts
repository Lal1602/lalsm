import type { SectionId } from "./actions";
import type { ChatLang } from "./copy";

/**
 * Where the visitor is on the page, as far as the assistant is concerned. The overlay watches which section is under
 * the middle of the window and tells the store; the store sends it with each question (so the model knows what "this"
 * means) and the empty state offers questions that fit the section.
 */

export const SECTION_LABELS: Record<SectionId, Record<ChatLang, string>> = {
  home: { id: "Beranda", en: "Home" },
  about: { id: "What I Build", en: "What I Build" },
  workflow: { id: "How I Work", en: "How I Work" },
  playground: { id: "Creative Playground", en: "Creative Playground" },
  projects: { id: "Proyek", en: "Projects" },
  achievements: { id: "Sertifikat", en: "Achievements" },
  contact: { id: "Kontak", en: "Contact" },
};

/** What the model is told the visitor is looking at. */
export const SECTION_DESCRIPTIONS: Record<SectionId, string> = {
  home: "bagian paling atas (hero): judul Creative Developer, potret, dan tombol",
  about: "bagian What I Build: tiga disiplin (frontend, backend & devops, mobile & game) beserta alat-alatnya",
  workflow: "bagian How I Work: empat tahap kerja Bilal di peta rute",
  playground: "bagian Creative Playground: dek observasi dan jalur karier",
  projects: "bagian Projects: galeri pelat proyek",
  achievements: "bagian Achievements: sertifikat dan prestasi",
  contact: "bagian Contact: form Uplink dan tautan sosial",
};

const SUGGESTIONS: Record<SectionId, Record<ChatLang, string[]>> = {
  home: {
    id: ["Siapa Bilal sebenarnya?", "Apa saja keahlian coding Bilal?", "Tunjukkan proyek terbaiknya"],
    en: ["Who is Bilal, really?", "What are Bilal's coding skills?", "Show me his best project"],
  },
  about: {
    id: ["Apa bedanya frontend dan backend di sini?", "Tool apa yang paling sering dipakai?", "Bilal bikin game juga?"],
    en: ["What is the split between frontend and backend here?", "Which tools does he use most?", "Does Bilal make games too?"],
  },
  workflow: {
    id: ["Bagaimana Bilal memulai sebuah proyek?", "Berapa lama satu proyek biasanya?", "Apa yang saya dapat di tiap tahap?"],
    en: ["How does Bilal start a project?", "How long does a project usually take?", "What do I get at each stage?"],
  },
  playground: {
    id: ["Apa itu kursor tabung ini?", "Ceritakan jalur kariernya", "Bagaimana situs ini tetap 60fps?"],
    en: ["What is this tube cursor?", "Tell me about his career path", "How does this site stay at 60fps?"],
  },
  projects: {
    id: ["Proyek mana yang paling rumit?", "Tunjukkan proyek game", "Proyek mana yang pakai Three.js?"],
    en: ["Which project is the most complex?", "Show me the game projects", "Which projects use Three.js?"],
  },
  achievements: {
    id: ["Prestasi mana yang paling bergengsi?", "Ceritakan soal LKS", "Skor TOEIC-nya berapa?"],
    en: ["Which award is the most prestigious?", "Tell me about the LKS", "What is his TOEIC score?"],
  },
  contact: {
    id: ["Bagaimana cara merekrut Bilal?", "Apakah Bilal terbuka untuk freelance?", "Kirim ringkasan percakapan ini ke Bilal"],
    en: ["How do I hire Bilal?", "Is Bilal open to freelance work?", "Send a summary of this chat to Bilal"],
  },
};

export const isSectionId = (value: unknown): value is SectionId =>
  typeof value === "string" && Object.prototype.hasOwnProperty.call(SECTION_LABELS, value);

export const sectionLabel = (id: SectionId, lang: ChatLang): string => SECTION_LABELS[id][lang];

export function suggestionsFor(section: SectionId | null | undefined, lang: ChatLang): string[] {
  return SUGGESTIONS[section && isSectionId(section) ? section : "home"][lang];
}

/**
 * The section in the middle of the window, given each one's top and bottom in client coordinates. The middle line
 * wins, so a tall pinned section keeps the visitor while it is under their eyes. Null when nothing is there.
 */
export function sectionAt(
  rects: ReadonlyArray<{ id: SectionId; top: number; bottom: number }>,
  middle: number,
): SectionId | null {
  let best: { id: SectionId; size: number } | null = null;
  for (const r of rects) {
    if (r.top <= middle && r.bottom >= middle) {
      // The innermost wins when sections nest (a smaller box around the same line).
      const size = r.bottom - r.top;
      if (!best || size < best.size) best = { id: r.id, size };
    }
  }
  return best?.id ?? null;
}
