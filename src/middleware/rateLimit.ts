import { NextRequest } from "next/server";
import { RateLimitError } from "@/errors";

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 100,
};

const requestCounts = new Map<string, { count: number; resetTime: number }>();

export async function rateLimitMiddleware(
  request: NextRequest,
  config: RateLimitConfig = defaultConfig
) {
  const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + config.windowMs });
    return;
  }

  if (record.count >= config.max) {
    throw new RateLimitError(`Rate limit exceeded. Try again in ${Math.ceil((record.resetTime - now) / 1000)}s`);
  }

  record.count++;
}

export function createRateLimiter(config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config };
  return (request: NextRequest) => rateLimitMiddleware(request, finalConfig);
}
