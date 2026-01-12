import { describe, it, expect } from "vitest";
import { employeeSchema, employeeFilterSchema } from "../employee";

describe("Employee Validations", () => {
  describe("employeeSchema", () => {
    it("validates correct employee", () => {
      const result = employeeSchema.safeParse({
        name: "John Doe",
        email: "john@company.com",
        department: "Engineering",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing required fields", () => {
      const result = employeeSchema.safeParse({ name: "John" });
      expect(result.success).toBe(false);
    });

    it("accepts optional fields", () => {
      const result = employeeSchema.safeParse({
        name: "John Doe",
        email: "john@company.com",
        department: "Engineering",
        position: "Senior Developer",
        phone: "123-456-7890",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("employeeFilterSchema", () => {
    it("provides defaults", () => {
      const result = employeeFilterSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });
  });
});
