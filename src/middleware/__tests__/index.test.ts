import { describe, it, expect } from "vitest";
import { cors, securityHeaders } from "../index";

describe("Middleware Utilities", () => {
  describe("cors", () => {
    it("returns CORS headers", () => {
      const mockRequest = {
        headers: { get: () => "https://example.com" },
      } as any;
      const headers = cors(mockRequest);
      expect(headers["Access-Control-Allow-Origin"]).toBe("https://example.com");
      expect(headers["Access-Control-Allow-Methods"]).toContain("GET");
    });

    it("defaults to wildcard origin", () => {
      const mockRequest = {
        headers: { get: () => null },
      } as any;
      const headers = cors(mockRequest);
      expect(headers["Access-Control-Allow-Origin"]).toBe("*");
    });
  });

  describe("securityHeaders", () => {
    it("returns security headers", () => {
      const headers = securityHeaders();
      expect(headers["X-Content-Type-Options"]).toBe("nosniff");
      expect(headers["X-Frame-Options"]).toBe("DENY");
      expect(headers["X-XSS-Protection"]).toBe("1; mode=block");
    });
  });
});
