import { GoogleGenAI, type Content } from "@google/genai";
import { NextResponse } from "next/server";
import { buildSystemInstruction } from "@/lib/chat/prompt";
import { checkRateLimit, getClientKey } from "@/lib/chat/rateLimit";
import { getSimulatedReply } from "@/lib/chat/simulated";
import { createReplySplitter } from "@/lib/chat/stream";
import { parseChatBody, type ChatHistoryItem } from "@/lib/chat/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Models are tried in order until one answers. Override with GEMINI_MODELS
 * (comma separated) — keep it to models that support systemInstruction.
 */
const DEFAULT_MODELS = ["gemini-flash-latest", "gemini-2.5-flash-lite"];
const MODELS = (process.env.GEMINI_MODELS ?? "")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);
const MODELS_TO_TRY = MODELS.length > 0 ? MODELS : DEFAULT_MODELS;

/** A model that has not produced its first token by now is skipped. */
const FIRST_TOKEN_TIMEOUT_MS = 10_000;
/** Hard ceiling for one whole answer. */
const TOTAL_TIMEOUT_MS = 30_000;

const NO_STORE = { "Cache-Control": "no-store" };

function toContents(history: ChatHistoryItem[], message: string): Content[] {
  const contents: Content[] = history.map((item) => ({
    role: item.role === "ai" ? "model" : "user",
    parts: [{ text: item.text }],
  }));
  contents.push({ role: "user", parts: [{ text: message }] });
  return contents;
}

/** Rejects browsers posting from another origin; same-origin and curl are fine. */
function isForeignOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
}

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { ...NO_STORE, ...headers } });
}

/**
 * GET /api/ai/chat: whether a live model is configured, so the interface can say so before the first question
 * (and say "offline" when it is not) instead of finding out from an answer. Reveals no key and no setting.
 */
export async function GET() {
  const live = Boolean(process.env.GEMINI_API_KEY);
  return json({ live });
}

export async function POST(request: Request) {
  if (isForeignOrigin(request)) return json({ error: "Forbidden." }, 403);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Body must be valid JSON." }, 400);
  }

  const parsed = parseChatBody(payload);
  if (!parsed.ok) return json({ error: parsed.error }, 400);
  const { message, history, tone, section } = parsed;

  const limit = await checkRateLimit(getClientKey(request.headers));
  if (!limit.allowed) {
    return json(
      { error: "Too many messages. Please slow down.", retryAfter: limit.retryAfter },
      429,
      { "Retry-After": String(limit.retryAfter) },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set; answering from the local simulation.");
    return json({ ...getSimulatedReply(message, history, { tone, section }), source: "simulated" });
  }

  const ai = new GoogleGenAI({ apiKey });
  const contents = toContents(history, message);
  // The base instruction plus what the interface knows: the tone the visitor chose, the section they are looking at.
  const systemInstruction = buildSystemInstruction({ tone, section });
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: Record<string, unknown>) =>
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));

      const overall = new AbortController();
      const overallTimer = setTimeout(() => overall.abort(), TOTAL_TIMEOUT_MS);
      request.signal.addEventListener("abort", () => overall.abort());

      try {
        for (const model of MODELS_TO_TRY) {
          const attempt = new AbortController();
          const onOverallAbort = () => attempt.abort();
          overall.signal.addEventListener("abort", onOverallAbort);
          let firstTokenTimer: ReturnType<typeof setTimeout> | undefined = setTimeout(
            () => attempt.abort(),
            FIRST_TOKEN_TIMEOUT_MS,
          );

          const splitter = createReplySplitter();
          let gotText = false;

          try {
            const response = await ai.models.generateContentStream({
              model,
              contents,
              config: {
                systemInstruction,
                temperature: 0.7,
                maxOutputTokens: 1200,
                abortSignal: attempt.signal,
              },
            });

            for await (const chunk of response) {
              const text = chunk.text;
              if (!text) continue;
              if (firstTokenTimer) {
                clearTimeout(firstTokenTimer);
                firstTokenTimer = undefined;
              }
              gotText = true;
              const visible = splitter.push(text);
              if (visible) send({ type: "delta", text: visible });
            }

            if (!gotText) throw new Error("Model returned no text.");

            const { reply, suggestions } = splitter.finish();
            send({ type: "done", reply, suggestions, model });
            return;
          } catch (error) {
            if (firstTokenTimer) clearTimeout(firstTokenTimer);
            console.warn(`Model ${model} failed:`, error instanceof Error ? error.message : error);

            // Once text reached the visitor, never restart on another model:
            // finish with what we have rather than showing two answers.
            if (gotText) {
              const { reply, suggestions } = splitter.finish();
              send({ type: "done", reply, suggestions, model, truncated: true });
              return;
            }
            if (overall.signal.aborted) break;
          } finally {
            overall.signal.removeEventListener("abort", onOverallAbort);
          }
        }

        // Every model failed or timed out: answer locally so the chat never dead-ends.
        const fallback = getSimulatedReply(message, history, { tone, section });
        send({ type: "done", ...fallback, model: "simulated" });
      } finally {
        clearTimeout(overallTimer);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      ...NO_STORE,
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "X-Accel-Buffering": "no",
    },
  });
}

