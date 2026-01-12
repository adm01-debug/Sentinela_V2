import { describe, it, expect } from "vitest";
import { reportSchema, reportFilterSchema } from "../report";

describe("Report Validators", () => {
  describe("reportSchema", () => {
    it("validates valid report", () => {
      const result = reportSchema.safeParse({
        name: "Weekly Report",
        type: "productivity",
        dateRange: {
          startDate: "2024-01-01T00:00:00Z",
          endDate: "2024-01-07T00:00:00Z",
        },
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid type", () => {
      const result = reportSchema.safeParse({
        name: "Test",
        type: "invalid",
        dateRange: { startDate: "2024-01-01T00:00:00Z", endDate: "2024-01-07T00:00:00Z" },
      });
      expect(result.success).toBe(false);
    });
  });

  describe("reportFilterSchema", () => {
    it("validates filters", () => {
      const result = reportFilterSchema.safeParse({ type: "activity", page: 1 });
      expect(result.success).toBe(true);
    });
  });
});
