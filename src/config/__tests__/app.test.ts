import { describe, it, expect } from "vitest";
import { appConfig } from "../app";

describe("App Config", () => {
  it("has correct app name", () => {
    expect(appConfig.name).toBe("Sentinela");
  });

  it("has version 18.0.0", () => {
    expect(appConfig.version).toBe("18.0.0");
  });

  it("has all features defined", () => {
    expect(appConfig.features.screenshots).toBeDefined();
    expect(appConfig.features.activityTracking).toBeDefined();
    expect(appConfig.features.reports).toBeDefined();
  });

  it("has limits defined", () => {
    expect(appConfig.limits.maxUploadSize).toBeGreaterThan(0);
    expect(appConfig.limits.maxEmployeesPerOrg).toBeGreaterThan(0);
  });

  it("has defaults defined", () => {
    expect(appConfig.defaults.pageSize).toBe(20);
    expect(appConfig.defaults.maxPageSize).toBe(100);
  });
});
