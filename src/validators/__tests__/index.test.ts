import { describe, it, expect } from "vitest";
import { paginationSchema, dateRangeSchema, idSchema } from "../index";

describe("Common Validators", () => {
  describe("paginationSchema", () => {
    it("has defaults", () => {
      const result = paginationSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it("rejects negative page", () => {
      const result = paginationSchema.safeParse({ page: -1 });
      expect(result.success).toBe(false);
    });
  });

  describe("dateRangeSchema", () => {
    it("validates valid range", () => {
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
      const result = idSchema.safeParse({
        id: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });
  });
});
