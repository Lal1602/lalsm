/**
 * Rate limiting for the public chat endpoint.
 *
 * Two layers, both sliding-window:
 *   - a burst limit (a human cannot read and answer faster than this), and
 *   - an hourly cap that bounds the worst-case token spend per visitor.
 *
 * State lives in process memory by default. That is exact on a single Node
 * server and best-effort on serverless, where each warm instance keeps its own
 * counters. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN and the same
 * limits are enforced globally through Redis instead.
 */

export interface RateLimitRule {
  /** Max requests inside the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export const CHAT_RATE_RULES: RateLimitRule[] = [
  { limit: 6, windowMs: 60_000 },
  { limit: 40, windowMs: 60 * 60_000 },
];

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the caller may retry. 0 when allowed. */
  retryAfter: number;
}

const hits = new Map<string, number[]>();
let lastSweep = 0;

/** Drops buckets whose newest hit is older than the longest window. */
function sweep(now: number, longestWindow: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, stamps] of hits) {
    if (stamps.length === 0 || now - stamps[stamps.length - 1] > longestWindow) hits.delete(key);
  }
}

export function checkMemoryLimit(
  key: string,
  rules: RateLimitRule[] = CHAT_RATE_RULES,
  now = Date.now(),
): RateLimitResult {
  const longest = Math.max(...rules.map((r) => r.windowMs));
  sweep(now, longest);

  const stamps = (hits.get(key) ?? []).filter((t) => now - t < longest);

  for (const rule of rules) {
    const inWindow = stamps.filter((t) => now - t < rule.windowMs);
    if (inWindow.length >= rule.limit) {
      const oldest = inWindow[0];
      hits.set(key, stamps);
      return { allowed: false, retryAfter: Math.max(1, Math.ceil((oldest + rule.windowMs - now) / 1000)) };
    }
  }

  stamps.push(now);
  hits.set(key, stamps);
  return { allowed: true, retryAfter: 0 };
}

/** Test hook. */
export function resetMemoryLimit() {
  hits.clear();
  lastSweep = 0;
}

async function checkUpstashLimit(
  key: string,
  rules: RateLimitRule[],
  url: string,
  token: string,
): Promise<RateLimitResult> {
  // Fixed-window counters per rule: INCR, then EXPIRE on first hit. Coarser than
  // the in-memory sliding window but a single round trip and good enough to
  // stop abuse.
  const commands = rules.flatMap((rule) => {
    const bucket = Math.floor(Date.now() / rule.windowMs);
    const redisKey = `chat:${rule.windowMs}:${key}:${bucket}`;
    return [
      ["INCR", redisKey],
      ["PEXPIRE", redisKey, String(rule.windowMs), "NX"],
    ];
  });

  const response = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
    signal: AbortSignal.timeout(1500),
  });
  if (!response.ok) throw new Error(`Upstash responded ${response.status}`);

  const results = (await response.json()) as Array<{ result?: number }>;
  const now = Date.now();
  for (let i = 0; i < rules.length; i++) {
    const count = Number(results[i * 2]?.result ?? 0);
    if (count > rules[i].limit) {
      const windowMs = rules[i].windowMs;
      const resetAt = (Math.floor(now / windowMs) + 1) * windowMs;
      return { allowed: false, retryAfter: Math.max(1, Math.ceil((resetAt - now) / 1000)) };
    }
  }
  return { allowed: true, retryAfter: 0 };
}

export async function checkRateLimit(
  key: string,
  rules: RateLimitRule[] = CHAT_RATE_RULES,
): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      return await checkUpstashLimit(key, rules, url.replace(/\/+$/, ""), token);
    } catch (error) {
      // A Redis outage must not take the chat down — degrade to local counters.
      console.warn("Rate limit store unavailable, using in-memory limiter:", error);
    }
  }
  return checkMemoryLimit(key, rules);
}

/** Best-effort client address from the proxy headers. */
export function getClientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || "unknown";
}
