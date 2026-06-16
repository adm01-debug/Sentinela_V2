import { describe, it, expect, beforeEach } from "vitest";
import { apiMonitor } from "@/lib/apiMonitor";

describe("apiMonitor", () => {
  beforeEach(() => {
    apiMonitor.reset();
  });

  it("records a query metric", () => {
    const metric = apiMonitor.record("employees", "select", 150);
    expect(metric.table).toBe("employees");
    expect(metric.operation).toBe("select");
    expect(metric.durationMs).toBe(150);
    expect(metric.slow).toBe(false);
  });

  it("flags slow queries", () => {
    const metric = apiMonitor.record("employees", "select", 3500);
    expect(metric.slow).toBe(true);
  });

  it("tracks async operations", async () => {
    const result = await apiMonitor.track("employees", "select", async () => {
      return "data";
    });
    expect(result).toBe("data");
    expect(apiMonitor.getHistory().length).toBe(1);
  });

  it("records error operations", async () => {
    await expect(
      apiMonitor.track("employees", "select", async () => {
        throw new Error("db error");
      })
    ).rejects.toThrow("db error");

    const history = apiMonitor.getHistory();
    expect(history.length).toBe(1);
    expect(history[0].operation).toBe("select:error");
  });

  it("provides accurate summary", () => {
    apiMonitor.record("employees", "select", 100);
    apiMonitor.record("employees", "select", 200);
    apiMonitor.record("alerts", "select", 4000);

    const summary = apiMonitor.getSummary();
    expect(summary.totalQueries).toBe(3);
    expect(summary.slowQueries).toBe(1);
    expect(summary.avgMs).toBeGreaterThan(0);
    expect(summary.byTable["employees"].count).toBe(2);
    expect(summary.byTable["alerts"].count).toBe(1);
  });

  it("respects MAX_HISTORY limit", () => {
    for (let i = 0; i < 250; i++) {
      apiMonitor.record("test", "select", 10);
    }
    expect(apiMonitor.getHistory().length).toBeLessThanOrEqual(200);
  });

  it("resets correctly", () => {
    apiMonitor.record("x", "y", 100);
    apiMonitor.reset();
    expect(apiMonitor.getHistory().length).toBe(0);
    expect(apiMonitor.getSummary().totalQueries).toBe(0);
  });
});
