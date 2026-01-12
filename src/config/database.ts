export const databaseConfig = {
  url: process.env.DATABASE_URL,
  pool: {
    min: 2,
    max: 10,
  },
  ssl: process.env.NODE_ENV === "production",
  logging: process.env.NODE_ENV !== "production",
  migrations: {
    tableName: "_migrations",
    directory: "./migrations",
  },
};

export const redisConfig = {
  url: process.env.REDIS_URL || "redis://localhost:6379",
  maxRetries: 3,
  retryDelay: 1000,
  keyPrefix: "sentinela:",
  ttl: {
    session: 24 * 60 * 60,
    cache: 5 * 60,
    rateLimit: 60,
  },
};

export type DatabaseConfig = typeof databaseConfig;
export type RedisConfig = typeof redisConfig;
