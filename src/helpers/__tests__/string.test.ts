import { describe, it, expect } from "vitest";
import { capitalize, truncate, slugify, initials, pluralize, maskEmail } from "../string";

describe("String Helpers", () => {
  describe("capitalize", () => {
    it("capitalizes first letter", () => {
      expect(capitalize("hello")).toBe("Hello");
      expect(capitalize("HELLO")).toBe("Hello");
    });
  });

  describe("truncate", () => {
    it("truncates long strings", () => {
      expect(truncate("Hello World", 8)).toBe("Hello...");
    });

    it("keeps short strings", () => {
      expect(truncate("Hi", 10)).toBe("Hi");
    });
  });

  describe("slugify", () => {
    it("creates slug", () => {
      expect(slugify("Hello World")).toBe("hello-world");
      expect(slugify("Test @#$ String")).toBe("test-string");
    });
  });

  describe("initials", () => {
    it("gets initials", () => {
      expect(initials("John Doe")).toBe("JD");
      expect(initials("Alice")).toBe("A");
    });
  });

  describe("pluralize", () => {
    it("handles singular", () => {
      expect(pluralize(1, "item")).toBe("item");
    });

    it("handles plural", () => {
      expect(pluralize(2, "item")).toBe("items");
    });
  });

  describe("maskEmail", () => {
    it("masks email", () => {
      expect(maskEmail("test@example.com")).toBe("te***@example.com");
    });
  });
});
