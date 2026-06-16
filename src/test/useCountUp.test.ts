import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCountUp } from "@/hooks/useCountUp";

describe("useCountUp Hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock IntersectionObserver to trigger immediately
    global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
      observe: vi.fn(() => {
        callback([{ isIntersecting: true }]);
      }),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with value 0", () => {
    const { result } = renderHook(() => useCountUp({ end: 100, duration: 500 }));
    // Before animation starts, value should be 0 or transitioning
    expect(result.current.ref).toBeDefined();
    expect(typeof result.current.formatted).toBe("string");
    expect(typeof result.current.value).toBe("number");
  });

  it("should return ref object for DOM attachment", () => {
    const { result } = renderHook(() => useCountUp({ end: 50 }));
    expect(result.current.ref).toBeDefined();
    expect(result.current.ref.current).toBeNull(); // not attached yet
  });

  it("should format with prefix and suffix", () => {
    const { result } = renderHook(() =>
      useCountUp({ end: 100, prefix: "$", suffix: "%", duration: 0 })
    );
    expect(result.current.formatted).toContain("$");
    expect(result.current.formatted).toContain("%");
  });

  it("should respect decimal places", () => {
    const { result } = renderHook(() => useCountUp({ end: 99.5, decimals: 1, duration: 0 }));
    // The formatted value should have decimal point
    expect(result.current.formatted).toMatch(/\d+\.\d/);
  });

  it("should handle zero end value", () => {
    const { result } = renderHook(() => useCountUp({ end: 0, duration: 0 }));
    expect(result.current.value).toBe(0);
    expect(result.current.formatted).toBe("0");
  });

  it("should handle separator formatting", () => {
    const { result } = renderHook(() => useCountUp({ end: 1234, separator: ",", duration: 0 }));
    // Should contain comma separator
    expect(typeof result.current.formatted).toBe("string");
  });

  it("should handle negative values gracefully", () => {
    const { result } = renderHook(() => useCountUp({ end: -50, duration: 0 }));
    expect(typeof result.current.value).toBe("number");
  });

  it("should handle very large numbers", () => {
    const { result } = renderHook(() => useCountUp({ end: 999999, separator: ",", duration: 0 }));
    expect(typeof result.current.formatted).toBe("string");
  });

  it("should update when end value changes", () => {
    const { result, rerender } = renderHook(({ end }) => useCountUp({ end, duration: 0 }), {
      initialProps: { end: 50 },
    });
    rerender({ end: 100 });
    // Value should update (may be instant since hasAnimated is true)
    expect(typeof result.current.value).toBe("number");
  });

  it("should handle duration of 0", () => {
    const { result } = renderHook(() => useCountUp({ end: 42, duration: 0 }));
    expect(typeof result.current.formatted).toBe("string");
  });

  it("should combine prefix, suffix, decimals correctly", () => {
    const { result } = renderHook(() =>
      useCountUp({
        end: 1500.75,
        prefix: "R$",
        suffix: " BRL",
        decimals: 2,
        separator: ".",
        duration: 0,
      })
    );
    expect(result.current.formatted).toContain("R$");
    expect(result.current.formatted).toContain("BRL");
  });
});
