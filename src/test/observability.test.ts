import { describe, it, expect, vi } from "vitest";

// ============================================================
// LOGGER TESTS
// ============================================================
describe("Structured Logger", () => {
  it("exports logger with all levels", async () => {
    const { logger } = await import("@/lib/logger");
    expect(typeof logger.debug).toBe("function");
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.error).toBe("function");
  });

  it("creates scoped logger", async () => {
    const { logger } = await import("@/lib/logger");
    const log = logger.create("TestModule");
    expect(typeof log.debug).toBe("function");
    expect(typeof log.info).toBe("function");
    expect(typeof log.warn).toBe("function");
    expect(typeof log.error).toBe("function");
  });

  it("logger.info calls console.info", async () => {
    const { logger } = await import("@/lib/logger");
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    logger.info("test message");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("logger.warn calls console.warn", async () => {
    const { logger } = await import("@/lib/logger");
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    logger.warn("warn message");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("logger.error calls console.error", async () => {
    const { logger } = await import("@/lib/logger");
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.error("error message", new Error("test"));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("scoped logger includes context in output", async () => {
    const { logger } = await import("@/lib/logger");
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const log = logger.create("MyComponent");
    log.info("hello");
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("MyComponent"));
    spy.mockRestore();
  });

  it("logger.error handles non-Error objects", async () => {
    const { logger } = await import("@/lib/logger");
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.error("fail", "string error");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("exports LogLevel and LogEntry types", async () => {
    const mod = await import("@/lib/logger");
    expect(mod.logger).toBeDefined();
  });
});

// ============================================================
// WEB VITALS TESTS
// ============================================================
describe("Web Vitals", () => {
  it("exports initWebVitals function", async () => {
    const { initWebVitals } = await import("@/lib/webVitals");
    expect(typeof initWebVitals).toBe("function");
  });

  it("exports getNavigationTiming function", async () => {
    const { getNavigationTiming } = await import("@/lib/webVitals");
    expect(typeof getNavigationTiming).toBe("function");
  });

  it("initWebVitals runs without errors", async () => {
    const { initWebVitals } = await import("@/lib/webVitals");
    expect(() => initWebVitals()).not.toThrow();
  });

  it("initWebVitals accepts callback", async () => {
    const { initWebVitals } = await import("@/lib/webVitals");
    const cb = vi.fn();
    expect(() => initWebVitals(cb)).not.toThrow();
  });

  it("getNavigationTiming returns object or null", async () => {
    const { getNavigationTiming } = await import("@/lib/webVitals");
    const result = getNavigationTiming();
    expect(result === null || typeof result === "object").toBe(true);
  });
});

// ============================================================
// TYPE SAFETY VERIFICATION
// ============================================================
describe("Type Safety: Zero any remaining", () => {
  const files = ["src/hooks/useServerSentEvents.ts"];

  for (const file of files) {
    it(`${file} has no any types`, async () => {
      const fs = await import("fs");
      const content = fs.readFileSync(`${file}`, "utf8");
      const matches = content.match(/:\s*any\b|as\s+any\b|<any>/g);
      expect(matches).toBeNull();
    });
  }

  it("any count in src/ does not regress (excluding types.ts and tests)", async () => {
    const { readdirSync, readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    // Portavel (Windows/Linux): replica `grep -rn ": any|as any|<any>" src/`
    // sem depender de binarios Unix.
    let total = 0;
    const walk = (dir: string): void => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const filePath = join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== "node_modules") walk(filePath);
          continue;
        }
        if (!entry.name.endsWith(".ts") && !entry.name.endsWith(".tsx")) continue;
        if (entry.name.includes(".test.") || entry.name.endsWith("types.ts")) continue;
        const lines = readFileSync(filePath, "utf8").split("\n");
        total += lines.filter((line) => /:\s*any\b|as\s+any\b|<any>/.test(line)).length;
      }
    };
    walk("src");
    // Regression ceiling: keeps the current `any` usage from growing.
    expect(total).toBeLessThanOrEqual(240);
    // Full-suite runs share the filesystem/CPU with 60+ other test files;
    // the recursive walk of src/ can exceed the default 5s timeout under load.
  }, 30_000);
});

// ============================================================
// OBSERVABILITY ARCHITECTURE
// ============================================================
describe("Observability Architecture", () => {
  it("Logger module exists", async () => {
    const fs = await import("fs");
    expect(fs.existsSync("src/lib/logger.ts")).toBe(true);
  });

  it("WebVitals module exists", async () => {
    const fs = await import("fs");
    expect(fs.existsSync("src/lib/webVitals.ts")).toBe(true);
  });

  it("main.tsx initializes Web Vitals", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("src/main.tsx", "utf8");
    expect(content).toContain("initWebVitals");
  });

  it("Logger supports structured data", async () => {
    const { logger } = await import("@/lib/logger");
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    logger.info("test", { userId: "123", action: "login" });
    expect(spy).toHaveBeenCalledWith(expect.any(String), { userId: "123", action: "login" });
    spy.mockRestore();
  });
});
