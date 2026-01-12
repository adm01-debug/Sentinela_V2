import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, forgotPasswordSchema } from "../auth";

describe("Auth Validations", () => {
  describe("loginSchema", () => {
    it("validates correct login", () => {
      const result = loginSchema.safeParse({ email: "test@test.com", password: "password123" });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const result = loginSchema.safeParse({ email: "invalid", password: "password123" });
      expect(result.success).toBe(false);
    });

    it("rejects short password", () => {
      const result = loginSchema.safeParse({ email: "test@test.com", password: "short" });
      expect(result.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    it("validates correct registration", () => {
      const result = registerSchema.safeParse({
        email: "test@test.com",
        password: "Password1",
        confirmPassword: "Password1",
        name: "Test User",
      });
      expect(result.success).toBe(true);
    });

    it("rejects mismatched passwords", () => {
      const result = registerSchema.safeParse({
        email: "test@test.com",
        password: "Password1",
        confirmPassword: "Different1",
        name: "Test User",
      });
      expect(result.success).toBe(false);
    });
  });
});
