import { describe, it, expect } from "vitest";
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
} from "../AppError";

describe("AppError", () => {
  it("creates error with defaults", () => {
    const error = new AppError("Test error");
    expect(error.message).toBe("Test error");
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe("INTERNAL_ERROR");
    expect(error.isOperational).toBe(true);
  });

  it("creates error with custom values", () => {
    const error = new AppError("Custom", 400, "CUSTOM_ERROR");
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("CUSTOM_ERROR");
  });
});

describe("ValidationError", () => {
  it("creates validation error with errors object", () => {
    const error = new ValidationError({ email: ["Invalid email"] });
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.errors.email).toContain("Invalid email");
  });
});

describe("AuthenticationError", () => {
  it("creates auth error", () => {
    const error = new AuthenticationError();
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe("AUTHENTICATION_ERROR");
  });
});

describe("AuthorizationError", () => {
  it("creates authorization error", () => {
    const error = new AuthorizationError();
    expect(error.statusCode).toBe(403);
  });
});

describe("NotFoundError", () => {
  it("creates not found error", () => {
    const error = new NotFoundError("User");
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe("User not found");
  });
});

describe("RateLimitError", () => {
  it("creates rate limit error", () => {
    const error = new RateLimitError();
    expect(error.statusCode).toBe(429);
  });
});
