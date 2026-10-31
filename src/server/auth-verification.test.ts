import { describe, it, expect } from "vitest";
import {
  normalizeEmail,
  generateSixDigitCode,
  CURRENT_TERMS_VERSION,
} from "@/server/auth-verification";
import { rateLimit } from "@/lib/rate-limit";

describe("auth-verification helpers", () => {
  it("normalizes email addresses correctly", () => {
    expect(normalizeEmail("  User@Example.COM  ")).toBe("user@example.com");
    expect(normalizeEmail("John.Doe@Gmail.com")).toBe("john.doe@gmail.com");
  });

  it("generates valid 6-digit numeric verification codes", () => {
    for (let i = 0; i < 20; i++) {
      const code = generateSixDigitCode();
      expect(code).toHaveLength(6);
      expect(/^\d{6}$/.test(code)).toBe(true);
      const num = parseInt(code, 10);
      expect(num).toBeGreaterThanOrEqual(100000);
      expect(num).toBeLessThan(1000000);
    }
  });

  it("exports a stable terms of service version", () => {
    expect(CURRENT_TERMS_VERSION).toBe("1.0");
  });
});

describe("rateLimit", () => {
  it("allows requests within the limit and tracks remaining quota", () => {
    const key = `test-limit-${Date.now()}`;
    const first = rateLimit(key, 3, 5000);
    expect(first.success).toBe(true);
    expect(first.remaining).toBe(2);

    const second = rateLimit(key, 3, 5000);
    expect(second.success).toBe(true);
    expect(second.remaining).toBe(1);

    const third = rateLimit(key, 3, 5000);
    expect(third.success).toBe(true);
    expect(third.remaining).toBe(0);

    // 4th request exceeds limit
    const fourth = rateLimit(key, 3, 5000);
    expect(fourth.success).toBe(false);
    expect(fourth.remaining).toBe(0);
    expect(fourth.resetInMs).toBeGreaterThan(0);
  });
});

