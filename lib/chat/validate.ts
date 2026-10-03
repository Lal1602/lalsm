/**
 * Request validation for /api/ai/chat.
 *
 * The route is public and every call costs model tokens, so the body is treated
 * as hostile: roles are whitelisted, lengths are capped, and history is trimmed
 * to the last few turns no matter how much the client persisted.
 */

export const MAX_MESSAGE_CHARS = 500;
export const MAX_HISTORY_ITEMS = 10;
export const MAX_HISTORY_ITEM_CHARS = 1500;

export interface ChatHistoryItem {
  role: "user" | "ai";
  text: string;
}

export type ParsedChatBody =
  | { ok: true; message: string; history: ChatHistoryItem[] }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseChatBody(body: unknown): ParsedChatBody {
  if (!isRecord(body)) return { ok: false, error: "Body must be a JSON object." };

  const rawMessage = body.message;
  if (typeof rawMessage !== "string" || !rawMessage.trim()) {
    return { ok: false, error: "Message is required." };
  }
  const message = rawMessage.trim();
  if (message.length > MAX_MESSAGE_CHARS) {
    return { ok: false, error: `Message is too long (max ${MAX_MESSAGE_CHARS} characters).` };
  }

  const rawHistory = body.history;
  if (rawHistory !== undefined && !Array.isArray(rawHistory)) {
    return { ok: false, error: "History must be an array." };
  }

  const history: ChatHistoryItem[] = [];
  for (const item of rawHistory ?? []) {
    if (!isRecord(item)) continue;
    const { role, text } = item;
    if ((role !== "user" && role !== "ai") || typeof text !== "string" || !text.trim()) continue;
    history.push({ role, text: text.slice(0, MAX_HISTORY_ITEM_CHARS) });
  }

  return { ok: true, message, history: history.slice(-MAX_HISTORY_ITEMS) };
}
