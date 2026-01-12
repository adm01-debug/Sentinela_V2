import { describe, it, expect } from "vitest";
import { employeeSchema, employeeFilterSchema } from "../employee";

describe("Employee Validators", () => {
  describe("employeeSchema", () => {
    it("validates valid employee", () => {
      const result = employeeSchema.safeParse({
        name: "John Doe",
        email: "john@company.com",
        department: "Engineering",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing name", () => {
      const result = employeeSchema.safeParse({
        email: "john@company.com",
        department: "Engineering",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid email", () => {
      const result = employeeSchema.safeParse({
        name: "John Doe",
        email: "invalid",
        department: "Engineering",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("employeeFilterSchema", () => {
    it("validates filters", () => {
      const result = employeeFilterSchema.safeParse({
        search: "john",
        status: "active",
        page: 1,
      });
      expect(result.success).toBe(true);
    });
  });
});
