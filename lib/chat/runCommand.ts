import { cv } from "@/data/cv";
import { achievements } from "@/data/achievements";
import { getProject, projects } from "@/data/projects";
import { profile } from "@/data/profile";
import { useThemeStore } from "@/stores/themeStore";
import { switchTheme } from "@/lib/themeTransition";
import { openCvChooser } from "@/lib/cv/chooser";
import { achievementCard, projectCard, type ChatCard } from "./cards";
import { COMMANDS, type ParsedCommand } from "./commands";
import { COPY, type ChatLang } from "./copy";
import { transcriptFileName, transcriptMarkdown } from "./export";
import { runChatActions } from "./runActions";
import { TONES, isTone, type Tone } from "./tone";
import { TOUR_LENGTH, tourStep } from "./tour";
import type { ChatAction } from "./actions";
import type { Message, Suggestion } from "./types";

/**
 * What each slash command does. Client only (it moves the page, opens the CV chooser, switches the theme, saves a
 * file). The replies are made here, from the same data the page is made of, so they are instant and always true;
 * the store gives this the few things it needs and nothing else.
 */

export interface CommandApi {
  lang: ChatLang;
  tone: Tone;
  /** The current stop of the tour, or -1. */
  tour: number;
  messages: () => Message[];
  /** An assistant message made here, not by the model. */
  say: (m: { text: string; cards?: ChatCard[]; suggestions?: Suggestion[] }) => void;
  setTone: (tone: Tone) => void;
  setTour: (stop: number) => void;
  clear: () => void;
}

/** Saves the conversation as a markdown file. */
export function downloadTranscript(messages: Message[], lang: ChatLang) {
  const when = new Date();
  const blob = new Blob([transcriptMarkdown(messages, { lang, when })], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = transcriptFileName(when);
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const scroll = (sectionId: Extract<ChatAction, { type: "scroll" }>["sectionId"]) => runChatActions([{ type: "scroll", sectionId }]);

const compact = <T,>(items: (T | null)[]): T[] => items.filter((i): i is T => i !== null);

export function runCommand({ command, args }: ParsedCommand, api: CommandApi) {
  const en = api.lang === "en";
  const L = (id: string, english: string) => (en ? english : id);

  switch (command.id) {
    case "projects": {
      const picks = compact(["noir-photography", "mindpoint", "aether-dreamscape"].map((slug) => getProject(slug)).map((p) => (p ? projectCard(p.title) : null)));
      api.say({
        text: L(
          `Ada **${projects.length} proyek** di arsip, digambar sebagai pelat di galeri. Tiga untuk memulai:`,
          `There are **${projects.length} projects** in the archive, drawn as plates in the gallery. Three to start with:`,
        ),
        cards: picks,
        suggestions: [L("Proyek mana yang paling rumit?", "Which project is the most complex?"), L("Tunjukkan proyek game", "Show me the game projects")],
      });
      scroll("projects");
      return;
    }

    case "skills": {
      const groups = cv[api.lang].skills.map((g) => `- **${g.label}**: ${g.items.join(", ")}`).join("\n");
      api.say({
        text: `${L("Keahlian teknis Bilal, per kelompok:", "Bilal's technical skills, by group:")}\n\n${groups}`,
        suggestions: [{ label: L("Unduh CV", "Download the CV"), command: "/cv" }, L("Tool apa yang paling sering dipakai?", "Which tools does he use most?")],
      });
      scroll("about");
      return;
    }

    case "certificates": {
      const picks = compact(["LKS", "BNSP", "TOEIC"].map((k) => achievementCard(k)));
      api.say({
        text: L(
          `**${achievements.length} sertifikat dan penghargaan**, dari lomba LKS dan sertifikasi BNSP sampai TOEIC 610 dan kursus Timedoor. Beberapa yang paling sering ditanyakan:`,
          `**${achievements.length} certificates and awards**, from the LKS competition and the BNSP certification to TOEIC 610 and the Timedoor courses. The ones asked about most:`,
        ),
        cards: picks,
      });
      scroll("achievements");
      return;
    }

    case "cv": {
      openCvChooser("assistant");
      api.say({
        text: L(
          "CV Bilal ada dalam dua edisi, **bahasa Indonesia** dan **Inggris**: PDF dua halaman dengan isi yang sama. Pilihannya sudah terbuka.",
          "Bilal's CV comes in two editions, **English** and **Indonesian**: a two-page PDF with the same content. The choice is open.",
        ),
        cards: [{ kind: "cv" }],
      });
      return;
    }

    case "contact": {
      api.say({
        text: L(
          `Cara tercepat: email [${profile.email}](mailto:${profile.email}), atau form **Uplink** di bagian Contact. Bilal terbuka untuk kolaborasi dan pekerjaan freelance.`,
          `The quickest way: e-mail [${profile.email}](mailto:${profile.email}), or the **Uplink** form in the Contact section. Bilal is open to collaboration and freelance work.`,
        ),
        cards: [{ kind: "section", id: "contact" }],
        suggestions: [{ label: L("Unduh CV dulu", "Take the CV first"), command: "/cv" }],
      });
      scroll("contact");
      return;
    }

    case "theme": {
      const to = useThemeStore.getState().theme.type === "dark" ? "light" : "dark";
      switchTheme(() => useThemeStore.getState().nextTheme(), { x: window.innerWidth - 80, y: 40 });
      api.say({ text: L(`Tema diganti ke **${to === "dark" ? "gelap" : "terang"}**.`, `Switched to the **${to}** theme.`) });
      return;
    }

    case "tone": {
      const wanted = args.toLowerCase();
      if (isTone(wanted)) {
        api.setTone(wanted);
        const t = COPY[api.lang].tones[wanted];
        api.say({ text: L(`Gaya bicara: **${t.label}** (${t.hint}). Berlaku untuk jawaban berikutnya.`, `Tone: **${t.label}** (${t.hint}). It applies from the next answer.`) });
        return;
      }
      api.say({
        text: L(`Gaya bicara sekarang: **${COPY[api.lang].tones[api.tone].label}**. Pilih yang lain:`, `The tone is **${COPY[api.lang].tones[api.tone].label}** now. Pick another:`),
        suggestions: TONES.filter((t) => t !== api.tone).map((t) => ({ label: COPY[api.lang].tones[t].label, command: `/tone ${t}` })),
      });
      return;
    }

    case "export": {
      const messages = api.messages();
      if (!messages.some((m) => m.role === "user")) {
        api.say({ text: L("Belum ada percakapan untuk disimpan. Tanya sesuatu dulu.", "There is no conversation to save yet. Ask something first.") });
        return;
      }
      downloadTranscript(messages, api.lang);
      api.say({ text: L("Percakapan disimpan sebagai berkas **.md**.", "The conversation is saved as a **.md** file.") });
      return;
    }

    case "clear":
      api.clear();
      return;

    case "help": {
      const lines = COMMANDS.map((c) => `- \`/${c.name}${c.arg ? ` ${c.arg}` : ""}\`: ${c.hint[api.lang]}`).join("\n");
      api.say({
        text: `${L("Perintah yang kupahami (tanpa menunggu model):", "The commands I understand (no waiting for the model):")}\n\n${lines}\n\n${L("Tekan `/` di kotak pesan untuk daftarnya, `Ctrl K` untuk membuka asisten dari mana saja.", "Press `/` in the message box for the list, `Ctrl K` to open the assistant from anywhere.")}`,
      });
      return;
    }

    case "tour": {
      const arg = args.toLowerCase();
      if (arg === "stop") {
        api.setTour(-1);
        api.say({ text: L("Tur selesai. Tanya apa saja, atau pakai `/` untuk perintah.", "Tour over. Ask anything, or use `/` for commands.") });
        return;
      }
      const index = arg === "next" && api.tour >= 0 ? api.tour + 1 : 0;
      const step = index < TOUR_LENGTH ? tourStep(index, api.lang) : null;
      if (!step) {
        api.setTour(-1);
        api.say({ text: L("Itu pemberhentian terakhir.", "That was the last stop.") });
        return;
      }
      api.setTour(index);
      api.say({
        text: `_${step.title}_\n\n${step.stop.text}`,
        cards: step.stop.cv ? [{ kind: "cv" }] : undefined,
        suggestions: step.chips,
      });
      scroll(step.stop.section);
      return;
    }
  }
}
