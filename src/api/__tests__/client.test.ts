import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiClient } from "../client";

global.fetch = vi.fn();

describe("ApiClient", () => {
  let client: ApiClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new ApiClient("/api");
  });

  describe("GET requests", () => {
    it("makes GET request", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: "test" }),
      });
      const result = await client.get("/test");
      expect(result).toEqual({ data: "test" });
    });

    it("includes params in URL", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });
      await client.get("/test", { params: { page: "1" } });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("page=1"),
        expect.any(Object)
      );
    });
  });

  describe("POST requests", () => {
    it("sends JSON body", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 1 }),
      });
      await client.post("/test", { name: "Test" });
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "Test" }),
        })
      );
    });
  });

  describe("Authentication", () => {
    it("includes token when set", async () => {
      client.setToken("test-token");
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });
      await client.get("/test");
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        })
      );
    });
  });
});
