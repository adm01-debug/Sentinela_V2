import { describe, it, expect } from "vitest";
import { databaseConfig, redisConfig } from "../database";

describe("Database Config", () => {
  it("has pool settings", () => {
    expect(databaseConfig.pool.min).toBeGreaterThan(0);
    expect(databaseConfig.pool.max).toBeGreaterThan(databaseConfig.pool.min);
  });

  it("has migrations config", () => {
    expect(databaseConfig.migrations.tableName).toBe("_migrations");
    expect(databaseConfig.migrations.directory).toBeDefined();
  });
});

describe("Redis Config", () => {
  it("has default URL", () => {
    expect(redisConfig.url).toBeDefined();
  });

  it("has TTL settings", () => {
    expect(redisConfig.ttl.session).toBeGreaterThan(0);
    expect(redisConfig.ttl.cache).toBeGreaterThan(0);
    expect(redisConfig.ttl.rateLimit).toBeGreaterThan(0);
  });

  it("has key prefix", () => {
    expect(redisConfig.keyPrefix).toBe("sentinela:");
  });
});
