import { describe, it, expect, vi } from "vitest";
import { config, authConfig, emailConfig } from "../index";

describe("Config Index", () => {
  describe("config", () => {
    it("has env defined", () => {
      expect(config.env).toBeDefined();
    });

    it("has boolean flags", () => {
      expect(typeof config.isDev).toBe("boolean");
      expect(typeof config.isProd).toBe("boolean");
      expect(typeof config.isTest).toBe("boolean");
    });
  });

  describe("authConfig", () => {
    it("has JWT settings", () => {
      expect(authConfig.jwt.expiresIn).toBe("1d");
      expect(authConfig.jwt.refreshExpiresIn).toBe("7d");
    });

    it("has session settings", () => {
      expect(authConfig.session.maxAge).toBeGreaterThan(0);
    });
  });

  describe("emailConfig", () => {
    it("has from address", () => {
      expect(emailConfig.from).toContain("@");
    });

    it("has SMTP settings", () => {
      expect(emailConfig.smtp).toBeDefined();
      expect(emailConfig.smtp.port).toBeGreaterThan(0);
    });
  });
});
