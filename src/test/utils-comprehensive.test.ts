// ============================================================
// UTILITY FUNCTIONS TESTS
// ============================================================

import { describe, it, expect } from "vitest";
import { formatDuration, clamp } from "@/lib/utils/number";
import { truncate, slugify, capitalize, maskString } from "@/lib/utils/string";
import { uniqueBy, groupBy, chunk } from "@/lib/utils/collections";

describe("formatDuration", () => {
  it("formats seconds only", () => {
    expect(formatDuration(45)).toBe("45s");
  });

  it("formats minutes and seconds", () => {
    expect(formatDuration(125)).toBe("2m 5s");
  });

  it("formats hours, minutes, seconds", () => {
    expect(formatDuration(3661)).toBe("1h 1m 1s");
  });

  it("returns 0s for negative input", () => {
    expect(formatDuration(-5)).toBe("0s");
  });

  it("returns 0s for zero", () => {
    expect(formatDuration(0)).toBe("0s");
  });
});

describe("clamp", () => {
  it("clamps below min", () => {
    expect(clamp(-5, 0, 100)).toBe(0);
  });

  it("clamps above max", () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });

  it("returns value within range", () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });
});

describe("truncate", () => {
  it("truncates long strings", () => {
    expect(truncate("Hello World Test", 10)).toBe("Hello W...");
  });

  it("returns short strings unchanged", () => {
    expect(truncate("Hi", 10)).toBe("Hi");
  });
});

describe("slugify", () => {
  it("converts to slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });
});

describe("capitalize", () => {
  it("capitalizes first letter", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("handles empty string", () => {
    expect(capitalize("")).toBe("");
  });
});

describe("maskString", () => {
  it("masks middle of string", () => {
    const result = maskString("1234567890");
    expect(result).toContain("*");
    expect(result.length).toBe(10);
  });
});

describe("uniqueBy", () => {
  it("removes duplicates by key", () => {
    const items = [
      { id: 1, name: "a" },
      { id: 1, name: "b" },
      { id: 2, name: "c" },
    ];
    expect(uniqueBy(items, "id")).toHaveLength(2);
  });
});

describe("groupBy", () => {
  it("groups items by key", () => {
    const items = [
      { dept: "TI", name: "João" },
      { dept: "RH", name: "Maria" },
      { dept: "TI", name: "Pedro" },
    ];
    const grouped = groupBy(items, "dept");
    expect(grouped["TI"]).toHaveLength(2);
    expect(grouped["RH"]).toHaveLength(1);
  });
});

describe("chunk", () => {
  it("splits array into chunks", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("handles empty array", () => {
    expect(chunk([], 3)).toEqual([]);
  });
});
