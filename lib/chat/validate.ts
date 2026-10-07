/**
 * Request validation for /api/ai/chat.
 *
 * The route is public and every call costs model tokens, so the body is treated
 * as hostile: roles are whitelisted, lengths are capped, and history is trimmed
 * to the last few turns no matter how much the client persisted.
 */

import type { SectionId } from "./actions";
import { isSectionId } from "./context";
import { CHAT_LANGS, type ChatLang } from "./copy";
import { isTone, type Tone } from "./tone";

export const MAX_MESSAGE_CHARS = 500;
export const MAX_HISTORY_ITEMS = 10;
export const MAX_HISTORY_ITEM_CHARS = 1500;

export interface ChatHistoryItem {
  role: "user" | "ai";
  text: string;
}

export type ParsedChatBody =
  | { ok: true; message: string; history: ChatHistoryItem[]; tone?: Tone; section?: SectionId; lang?: ChatLang }
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

  // Optional hints about the visitor. Anything not on the lists is dropped, never passed on to the prompt.
  const result: ParsedChatBody = { ok: true, message, history: history.slice(-MAX_HISTORY_ITEMS) };
  if (isTone(body.tone) && body.tone !== "default") result.tone = body.tone;
  if (isSectionId(body.section)) result.section = body.section as SectionId;
  if (typeof body.lang === "string" && (CHAT_LANGS as readonly string[]).includes(body.lang)) result.lang = body.lang as ChatLang;
  return result;
}
