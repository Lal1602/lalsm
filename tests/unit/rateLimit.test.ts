import { beforeEach, describe, expect, it } from "vitest";
import { checkMemoryLimit, getClientKey, resetMemoryLimit, type RateLimitRule } from "@/lib/chat/rateLimit";

const RULES: RateLimitRule[] = [
  { limit: 3, windowMs: 1000 },
  { limit: 5, windowMs: 10_000 },
];

describe("checkMemoryLimit", () => {
  beforeEach(resetMemoryLimit);

  it("allows up to the burst limit, then blocks with a retry hint", () => {
    const t = 1_000_000;
    for (let i = 0; i < 3; i++) expect(checkMemoryLimit("ip", RULES, t + i).allowed).toBe(true);

    const blocked = checkMemoryLimit("ip", RULES, t + 10);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThanOrEqual(1);
  });

  it("recovers once the window has slid past", () => {
    const t = 2_000_000;
    for (let i = 0; i < 3; i++) checkMemoryLimit("ip", RULES, t);
    expect(checkMemoryLimit("ip", RULES, t + 100).allowed).toBe(false);
    expect(checkMemoryLimit("ip", RULES, t + 1100).allowed).toBe(true);
  });

  it("enforces the longer window even when bursts are spaced out", () => {
    const t = 3_000_000;
    for (let i = 0; i < 5; i++) expect(checkMemoryLimit("ip", RULES, t + i * 1500).allowed).toBe(true);
    expect(checkMemoryLimit("ip", RULES, t + 5 * 1500).allowed).toBe(false);
  });

  it("keeps visitors independent", () => {
    const t = 4_000_000;
    for (let i = 0; i < 3; i++) checkMemoryLimit("a", RULES, t);
    expect(checkMemoryLimit("a", RULES, t).allowed).toBe(false);
    expect(checkMemoryLimit("b", RULES, t).allowed).toBe(true);
  });
});

describe("getClientKey", () => {
  it("prefers the first x-forwarded-for hop", () => {
    const headers = new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1", "x-real-ip": "9.9.9.9" });
    expect(getClientKey(headers)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip, then 'unknown'", () => {
    expect(getClientKey(new Headers({ "x-real-ip": "9.9.9.9" }))).toBe("9.9.9.9");
    expect(getClientKey(new Headers())).toBe("unknown");
  });
});
