/**
 * The assistant's tone of voice. The prompt always allowed two optional modes if the visitor asked for them in
 * words; the interface now offers them as a setting, and the server adds the matching line to the prompt.
 */

export type Tone = "default" | "bro" | "sensei";
export const TONES: readonly Tone[] = ["default", "bro", "sensei"];

export const isTone = (value: unknown): value is Tone => typeof value === "string" && (TONES as readonly string[]).includes(value);

/** The line the prompt gets for a tone (nothing for the default). */
export function toneInstruction(tone: Tone | undefined): string {
  switch (tone) {
    case "bro":
      return "Nada saat ini: ACT_LIKE_BRO. Pakai gaya santai penuh slang (bro, cuy, mantap), tetap sopan dan tetap akurat.";
    case "sensei":
      return "Nada saat ini: ACT_LIKE_SENSEI. Pakai gaya formal, filosofis, dan tegas, tetap hangat dan tetap akurat.";
    default:
      return "";
  }
}

/**
 * The offline answers are fixed sentences, so a tone can only dress them: a few words in front and behind. It is
 * honest about what it is (the live model does the real thing).
 */
export function tonify(text: string, tone: Tone | undefined): string {
  if (tone === "bro") return `Santai cuy! ${text.replace(/\bAnda\b/gi, "kamu")}`;
  if (tone === "sensei") return `Dengan hormat. ${text.replace(/\bkamu\b/g, "Anda")} Semoga bermanfaat.`;
  return text;
}
