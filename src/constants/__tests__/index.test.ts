import { describe, it, expect } from "vitest";
import { APP_NAME, APP_VERSION, PAGINATION, DATE_FORMATS, FILE_LIMITS } from "../index";

describe("Constants Index", () => {
  it("exports app info", () => {
    expect(APP_NAME).toBe("Sentinela");
    expect(APP_VERSION).toBe("18.0.0");
  });

  it("exports pagination defaults", () => {
    expect(PAGINATION.DEFAULT_PAGE).toBe(1);
    expect(PAGINATION.DEFAULT_LIMIT).toBe(20);
    expect(PAGINATION.MAX_LIMIT).toBe(100);
  });

  it("exports date formats", () => {
    expect(DATE_FORMATS.DATE).toBeDefined();
    expect(DATE_FORMATS.DATETIME).toBeDefined();
  });

  it("exports file limits", () => {
    expect(FILE_LIMITS.MAX_UPLOAD_SIZE).toBeGreaterThan(0);
    expect(FILE_LIMITS.ALLOWED_IMAGE_TYPES).toContain("image/jpeg");
  });
});
