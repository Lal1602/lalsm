import { SUGGESTIONS_DELIMITER } from "./prompt";

/**
 * The model answers as "<reply>\n<<<SUGGESTIONS>>>\n[...json...]". While the
 * reply streams we must forward only the part before the delimiter, and the
 * delimiter itself can arrive split across chunks ("<<<SUGG" + "ESTIONS>>>").
 * This splitter holds back a possible partial delimiter until it is resolved.
 */
export function createReplySplitter() {
  let buffer = "";
  let emitted = 0;
  let delimiterAt = -1;

  return {
    /** Feeds a chunk, returns the new reply text that is safe to show. */
    push(chunk: string): string {
      buffer += chunk;
      if (delimiterAt === -1) delimiterAt = buffer.indexOf(SUGGESTIONS_DELIMITER);

      let safeEnd: number;
      if (delimiterAt !== -1) {
        safeEnd = delimiterAt;
      } else {
        // Keep back any tail that could still turn into the delimiter.
        safeEnd = buffer.length;
        const max = Math.min(SUGGESTIONS_DELIMITER.length - 1, buffer.length);
        for (let n = max; n > 0; n--) {
          if (SUGGESTIONS_DELIMITER.startsWith(buffer.slice(buffer.length - n))) {
            safeEnd = buffer.length - n;
            break;
          }
        }
      }

      if (safeEnd <= emitted) return "";
      const out = buffer.slice(emitted, safeEnd);
      emitted = safeEnd;
      return out;
    },

    /** Final parse once the stream has ended. */
    finish(): { reply: string; suggestions: string[] } {
      return parseModelOutput(buffer);
    },
  };
}

/** Splits the full model output into the reply text and its suggestions. */
export function parseModelOutput(full: string): { reply: string; suggestions: string[] } {
  const at = full.indexOf(SUGGESTIONS_DELIMITER);
  const reply = (at === -1 ? full : full.slice(0, at)).trim();
  const tail = at === -1 ? "" : full.slice(at + SUGGESTIONS_DELIMITER.length);
  return { reply, suggestions: parseSuggestions(tail) };
}

export function parseSuggestions(tail: string): string[] {
  const start = tail.indexOf("[");
  const end = tail.lastIndexOf("]");
  if (start === -1 || end <= start) return [];

  try {
    const parsed: unknown = JSON.parse(tail.slice(start, end + 1));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
      .map((s) => s.trim().slice(0, 140))
      .slice(0, 3);
  } catch {
    return [];
  }
}
