import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "../auth";

describe("Auth Validators", () => {
  describe("loginSchema", () => {
    it("validates valid login", () => {
      const result = loginSchema.safeParse({
        email: "test@test.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const result = loginSchema.safeParse({
        email: "invalid",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("rejects short password", () => {
      const result = loginSchema.safeParse({
        email: "test@test.com",
        password: "123",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    it("validates valid registration", () => {
      const result = registerSchema.safeParse({
        name: "Test User",
        email: "test@test.com",
        password: "Password123",
        confirmPassword: "Password123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects mismatched passwords", () => {
      const result = registerSchema.safeParse({
        name: "Test User",
        email: "test@test.com",
        password: "Password123",
        confirmPassword: "Different123",
      });
      expect(result.success).toBe(false);
    });
  });
});
