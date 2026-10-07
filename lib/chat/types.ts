import type { ChatCard } from "./cards";

/** A chip under a reply: words to send, or (with a command) something to do. */
export type Suggestion = string | { label: string; command: string };

export interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  /** When it was written (ms since the epoch). */
  ts: number;
  suggestions?: Suggestion[];
  /** What the reply pointed at, as cards. */
  cards?: ChatCard[];
  /** True while the reply is still arriving from the stream. */
  streaming?: boolean;
  /** The visitor stopped it, or it was cut short; what arrived is kept. */
  stopped?: boolean;
  /** The question did not get an answer (offline, refused). */
  failed?: boolean;
  /** Who made the reply: the live model or the offline rules. Never guessed. */
  source?: "live" | "offline";
}

let counter = 0;
/** A short id that is unique within the page and across reloads. */
export function newMessageId(): string {
  counter += 1;
  return `${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** "[Penasaran] Proyek mana yang paling rumit?" -> its tone tag and its words. */
export function parseSuggestion(s: Suggestion): { tag?: string; text: string; command?: string } {
  if (typeof s !== "string") return { text: s.label, command: s.command };
  const m = /^\s*\[([^\]]{1,24})\]\s*(.+)$/.exec(s);
  return m ? { tag: m[1], text: m[2].trim() } : { text: s.trim() };
}
