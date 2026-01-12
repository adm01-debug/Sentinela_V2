import { describe, it, expect } from "vitest";
import { formatDate, formatDateTime, formatRelative, isValidDate, getDateRange } from "../date";

describe("Date Helpers", () => {
  describe("formatDate", () => {
    it("formats valid date", () => {
      expect(formatDate("2024-01-15")).toContain("2024");
    });

    it("handles invalid date", () => {
      expect(formatDate("invalid")).toBe("Invalid date");
    });
  });

  describe("formatRelative", () => {
    it("returns relative time", () => {
      const result = formatRelative(new Date());
      expect(result).toContain("ago");
    });
  });

  describe("isValidDate", () => {
    it("validates correct date", () => {
      expect(isValidDate("2024-01-15")).toBe(true);
    });

    it("invalidates wrong date", () => {
      expect(isValidDate("invalid")).toBe(false);
    });
  });

  describe("getDateRange", () => {
    it("returns date range", () => {
      const { start, end } = getDateRange(7);
      expect(start).toBeInstanceOf(Date);
      expect(end).toBeInstanceOf(Date);
      expect(start < end).toBe(true);
    });
  });
});
