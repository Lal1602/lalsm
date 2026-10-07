import type { ChatLang } from "./copy";

/**
 * Slash commands: things the assistant does by itself, without asking the model (so they are instant, free and the
 * same every time). Typing "/" opens the list; a message that is exactly a command (with its argument) runs it.
 * This file is the pure part: what the commands are, how a line of input is read, and which ones a prefix matches.
 */

export type CommandId =
  | "projects"
  | "skills"
  | "certificates"
  | "cv"
  | "contact"
  | "tour"
  | "theme"
  | "tone"
  | "export"
  | "clear"
  | "help";

export interface CommandDef {
  id: CommandId;
  /** Without the slash. */
  name: string;
  aliases: string[];
  hint: Record<ChatLang, string>;
  /** What can follow it, for the list ("<tone>"). */
  arg?: string;
  /** The argument is required: choosing the command from the list completes it and waits, instead of running it. */
  needsArg?: boolean;
}

export const COMMANDS: readonly CommandDef[] = [
  { id: "projects", name: "projects", aliases: ["proyek", "work"], hint: { id: "Galeri proyek dan tiga pilihan", en: "The gallery and three picks" } },
  { id: "skills", name: "skills", aliases: ["keahlian", "stack"], hint: { id: "Stack dan alat, per kelompok", en: "The stack and tools, by group" } },
  { id: "certificates", name: "certificates", aliases: ["sertifikat", "awards", "prestasi"], hint: { id: "Sertifikat dan prestasi", en: "Certificates and awards" } },
  { id: "cv", name: "cv", aliases: ["resume"], hint: { id: "Unduh CV (EN atau ID)", en: "Download the CV (EN or ID)" } },
  { id: "contact", name: "contact", aliases: ["kontak", "hire"], hint: { id: "Cara menghubungi Bilal", en: "How to reach Bilal" } },
  { id: "tour", name: "tour", aliases: ["tur"], arg: "[next|stop]", hint: { id: "Tur singkat keliling situs", en: "A short tour of the site" } },
  { id: "theme", name: "theme", aliases: ["tema"], hint: { id: "Ganti tema gelap / terang", en: "Switch dark / light" } },
  { id: "tone", name: "tone", aliases: ["gaya"], arg: "<default|bro|sensei>", needsArg: true, hint: { id: "Ubah gaya bicara", en: "Change the tone of voice" } },
  { id: "export", name: "export", aliases: ["ekspor", "save"], hint: { id: "Simpan percakapan (.md)", en: "Save the conversation (.md)" } },
  { id: "clear", name: "clear", aliases: ["reset", "mulai"], hint: { id: "Mulai percakapan baru", en: "Start a new conversation" } },
  { id: "help", name: "help", aliases: ["bantuan", "?"], hint: { id: "Daftar perintah", en: "List the commands" } },
];

export interface ParsedCommand {
  command: CommandDef;
  args: string;
}

const norm = (s: string) => s.trim().toLowerCase();

function byName(word: string): CommandDef | undefined {
  const w = norm(word);
  return COMMANDS.find((c) => c.name === w || c.aliases.includes(w));
}

/** "/tone bro" -> the tone command with "bro"; anything that is not exactly a known command is not one. */
export function parseCommand(input: string): ParsedCommand | null {
  const text = input.trim();
  if (!text.startsWith("/")) return null;
  const [word, ...rest] = text.slice(1).split(/\s+/);
  const command = byName(word);
  return command ? { command, args: rest.join(" ").trim() } : null;
}

/**
 * The commands a half-typed line matches, for the list: "/" is all of them, "/pr" the ones that start that way
 * (by name or alias). Once there is a space (an argument is being typed) the list is closed.
 */
export function matchCommands(input: string): CommandDef[] {
  if (!input.startsWith("/") || /\s/.test(input)) return [];
  const prefix = norm(input.slice(1));
  if (!prefix) return [...COMMANDS];
  return COMMANDS.filter((c) => c.name.startsWith(prefix) || c.aliases.some((a) => a.startsWith(prefix)));
}
