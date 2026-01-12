import { describe, it, expect } from "vitest";
import { handleError, isAppError } from "../errorHandler";
import { AppError, ValidationError } from "../AppError";

describe("handleError", () => {
  it("handles AppError", () => {
    const error = new AppError("Test", 400, "TEST");
    const result = handleError(error);
    expect(result.success).toBe(false);
    expect(result.error.statusCode).toBe(400);
    expect(result.error.code).toBe("TEST");
  });

  it("handles ValidationError with errors", () => {
    const error = new ValidationError({ email: ["Invalid"] });
    const result = handleError(error);
    expect(result.error.errors).toBeDefined();
    expect(result.error.errors?.email).toContain("Invalid");
  });

  it("handles generic Error", () => {
    const error = new Error("Generic error");
    const result = handleError(error);
    expect(result.error.statusCode).toBe(500);
    expect(result.error.code).toBe("INTERNAL_ERROR");
  });

  it("handles unknown error", () => {
    const result = handleError("string error");
    expect(result.error.code).toBe("UNKNOWN_ERROR");
  });
});

describe("isAppError", () => {
  it("returns true for AppError", () => {
    expect(isAppError(new AppError("test"))).toBe(true);
  });

  it("returns false for generic Error", () => {
    expect(isAppError(new Error("test"))).toBe(false);
  });
});
