import { describe, it, expect, vi } from "vitest";
import { cn, sleep, debounce, throttle } from "../index";

describe("Common Helpers", () => {
  describe("cn", () => {
    it("joins classes", () => {
      expect(cn("a", "b", "c")).toBe("a b c");
    });

    it("filters falsy values", () => {
      expect(cn("a", false, undefined, "b")).toBe("a b");
    });
  });

  describe("sleep", () => {
    it("resolves after delay", async () => {
      const start = Date.now();
      await sleep(50);
      expect(Date.now() - start).toBeGreaterThanOrEqual(45);
    });
  });

  describe("debounce", () => {
    it("debounces function calls", async () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      debounced();
      debounced();
      debounced();
      expect(fn).not.toHaveBeenCalled();
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });
  });
});
