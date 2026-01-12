import { describe, it, expect, vi } from "vitest";
import { requireRole } from "../auth";
import { AuthorizationError } from "@/errors";

describe("Auth Middleware", () => {
  describe("requireRole", () => {
    it("allows user with correct role", async () => {
      const user = { id: "1", email: "admin@test.com", role: "admin", organizationId: "org1" };
      const middleware = requireRole("admin", "superadmin");
      const result = await middleware(user);
      expect(result).toEqual(user);
    });

    it("throws for user without role", async () => {
      const user = { id: "1", email: "user@test.com", role: "user", organizationId: "org1" };
      const middleware = requireRole("admin");
      await expect(middleware(user)).rejects.toThrow(AuthorizationError);
    });

    it("allows multiple roles", async () => {
      const user = { id: "1", email: "mod@test.com", role: "moderator", organizationId: "org1" };
      const middleware = requireRole("admin", "moderator");
      const result = await middleware(user);
      expect(result.role).toBe("moderator");
    });
  });
});
