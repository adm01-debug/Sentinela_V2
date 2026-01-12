import { describe, it, expect } from "vitest";
import { profileSchema, securitySchema, notificationSchema } from "../settings";

describe("Settings Validators", () => {
  describe("profileSchema", () => {
    it("validates valid profile", () => {
      const result = profileSchema.safeParse({ name: "John Doe", email: "john@test.com" });
      expect(result.success).toBe(true);
    });
  });

  describe("securitySchema", () => {
    it("validates matching passwords", () => {
      const result = securitySchema.safeParse({
        currentPassword: "OldPass123",
        newPassword: "NewPass123",
        confirmPassword: "NewPass123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects mismatched passwords", () => {
      const result = securitySchema.safeParse({
        currentPassword: "OldPass123",
        newPassword: "NewPass123",
        confirmPassword: "Different123",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("notificationSchema", () => {
    it("validates notification settings", () => {
      const result = notificationSchema.safeParse({
        emailNotifications: true,
        pushNotifications: false,
        dailyDigest: true,
        alertsOnly: false,
      });
      expect(result.success).toBe(true);
    });
  });
});
