import { describe, it, expect } from "vitest";
import { API } from "../api";

describe("API Constants", () => {
  it("has base URL", () => {
    expect(API.BASE_URL).toBeDefined();
  });

  it("has all auth endpoints", () => {
    expect(API.ENDPOINTS.AUTH.LOGIN).toBeDefined();
    expect(API.ENDPOINTS.AUTH.LOGOUT).toBeDefined();
    expect(API.ENDPOINTS.AUTH.REGISTER).toBeDefined();
  });

  it("has resource endpoints", () => {
    expect(API.ENDPOINTS.USERS).toBeDefined();
    expect(API.ENDPOINTS.EMPLOYEES).toBeDefined();
    expect(API.ENDPOINTS.REPORTS).toBeDefined();
  });

  it("has headers", () => {
    expect(API.HEADERS.AUTHORIZATION).toBe("Authorization");
  });
});
