import { describe, it, expect } from "vitest";
import { paginationSchema, dateRangeSchema, idSchema } from "../index";

describe("Common Validations", () => {
  describe("paginationSchema", () => {
    it("provides defaults", () => {
      const result = paginationSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it("rejects invalid page", () => {
      const result = paginationSchema.safeParse({ page: 0 });
      expect(result.success).toBe(false);
    });

    it("caps limit at 100", () => {
      const result = paginationSchema.safeParse({ limit: 200 });
      expect(result.success).toBe(false);
    });
  });

  describe("dateRangeSchema", () => {
    it("validates correct range", () => {
      const result = dateRangeSchema.safeParse({
        startDate: "2024-01-01T00:00:00Z",
        endDate: "2024-01-31T00:00:00Z",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid range", () => {
      const result = dateRangeSchema.safeParse({
        startDate: "2024-01-31T00:00:00Z",
        endDate: "2024-01-01T00:00:00Z",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("idSchema", () => {
    it("validates UUID", () => {
      const result = idSchema.safeParse({ id: "123e4567-e89b-12d3-a456-426614174000" });
      expect(result.success).toBe(true);
    });
  });
});
