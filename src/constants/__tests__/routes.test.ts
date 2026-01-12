import { describe, it, expect } from "vitest";
import { ROUTES } from "../routes";

describe("Routes Constants", () => {
  it("has all required routes", () => {
    expect(ROUTES.HOME).toBe("/");
    expect(ROUTES.DASHBOARD).toBe("/dashboard");
    expect(ROUTES.LOGIN).toBe("/login");
  });

  it("has employee routes", () => {
    expect(ROUTES.EMPLOYEES).toBeDefined();
    expect(ROUTES.EMPLOYEE_DETAIL).toContain(":id");
  });

  it("has settings routes", () => {
    expect(ROUTES.SETTINGS).toBeDefined();
    expect(ROUTES.SETTINGS_PROFILE).toBeDefined();
  });

  it("has admin routes", () => {
    expect(ROUTES.ADMIN).toBeDefined();
    expect(ROUTES.ADMIN_USERS).toBeDefined();
  });
});
