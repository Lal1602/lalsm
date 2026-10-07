import type { ChatLang } from "./copy";
import type { Message } from "./types";

/** The conversation as a markdown file the visitor can keep (or send to Bilal). Never includes a reply still arriving. */
export function transcriptMarkdown(messages: readonly Message[], opts: { lang: ChatLang; when: Date }): string {
  const heading = opts.lang === "id" ? "Percakapan dengan B.I.L.A.L." : "Conversation with B.I.L.A.L.";
  const you = opts.lang === "id" ? "Kamu" : "You";
  const stamp = new Intl.DateTimeFormat(opts.lang === "id" ? "id-ID" : "en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(opts.when);

  const turns = messages
    .filter((m) => m.text.trim() && !m.streaming)
    .map((m) => {
      const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }).format(new Date(m.ts));
      const who = m.role === "user" ? you : "B.I.L.A.L.";
      return `**${who}** · ${time} WIB\n\n${m.text.trim()}`;
    });

  return [`# ${heading}`, "", `_${stamp} WIB_`, "", turns.length ? turns.join("\n\n---\n\n") : opts.lang === "id" ? "_(belum ada pesan)_" : "_(no messages yet)_", ""].join("\n");
}

/** A file name for it: stable, no spaces. */
export const transcriptFileName = (when: Date): string => `bilal-chat-${when.toISOString().slice(0, 10)}.md`;

/** The last turns as plain text, for the contact form or an e-mail to Bilal. Bounded: mail clients choke on long links. */
export function conversationSummary(messages: readonly Message[], lang: ChatLang, limit = 1200): string {
  const you = lang === "id" ? "Saya" : "Me";
  const turns = messages
    .filter((m) => m.text.trim() && !m.streaming && !m.failed)
    .slice(-8)
    .map((m) => `${m.role === "user" ? you : "B.I.L.A.L."}: ${m.text.trim()}`)
    .join("\n\n");
  const intro =
    lang === "id"
      ? "Halo Bilal,\n\nSaya mengobrol dengan asisten di portofoliomu dan ingin menindaklanjuti.\n\n--- Percakapan ---\n"
      : "Hi Bilal,\n\nI was chatting with your portfolio assistant and would like to follow up.\n\n--- Conversation ---\n";
  const body = `${intro}${turns || (lang === "id" ? "(belum ada pesan)" : "(no messages yet)")}`;
  return body.length > limit ? `${body.slice(0, limit)}…` : body;
}

export function mailtoHref(email: string, lang: ChatLang, body: string): string {
  const subject = lang === "id" ? "Menindaklanjuti dari portofoliomu" : "Following up from your portfolio";
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
