import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRateLimiter } from "../rateLimit";

describe("Rate Limit Middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows requests within limit", async () => {
    const limiter = createRateLimiter({ max: 5, windowMs: 1000 });
    const mockRequest = {
      ip: "127.0.0.1",
      headers: { get: () => null },
    } as any;

    await expect(limiter(mockRequest)).resolves.not.toThrow();
  });

  it("creates limiter with custom config", () => {
    const limiter = createRateLimiter({ max: 10, windowMs: 5000 });
    expect(limiter).toBeDefined();
    expect(typeof limiter).toBe("function");
  });
});
