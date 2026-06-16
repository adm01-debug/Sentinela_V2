import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
  endpoint: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
  blocked: boolean;
}

// Client-side rate limit tracking
const clientRateLimits = new Map<string, { count: number; resetAt: number }>();

export function useRateLimitByIP() {
  const ipRef = useRef<string | null>(null);

  const getClientIP = useCallback(async (): Promise<string> => {
    if (ipRef.current) return ipRef.current;

    try {
      // In production, this would be provided by the edge function
      // For now, use a fingerprint-based identifier
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      ipRef.current = data.ip;
      return data.ip;
    } catch {
      // Fallback to session-based identifier
      const sessionId = sessionStorage.getItem("rate_limit_id") || crypto.randomUUID();
      sessionStorage.setItem("rate_limit_id", sessionId);
      ipRef.current = sessionId;
      return sessionId;
    }
  }, []);

  const checkRateLimit = useCallback(
    async (config: RateLimitConfig): Promise<RateLimitResult> => {
      const ip = await getClientIP();
      const key = `${ip}:${config.endpoint}`;
      const now = Date.now();

      // Check client-side rate limit first (fast path)
      const existing = clientRateLimits.get(key);
      if (existing) {
        if (now < existing.resetAt) {
          if (existing.count >= config.maxRequests) {
            return {
              allowed: false,
              remaining: 0,
              resetIn: Math.ceil((existing.resetAt - now) / 1000),
              blocked: true,
            };
          }
          existing.count++;
          return {
            allowed: true,
            remaining: config.maxRequests - existing.count,
            resetIn: Math.ceil((existing.resetAt - now) / 1000),
            blocked: false,
          };
        } else {
          clientRateLimits.delete(key);
        }
      }

      // Initialize new rate limit window
      clientRateLimits.set(key, {
        count: 1,
        resetAt: now + config.windowSeconds * 1000,
      });

      // Also check server-side rate limit for stricter control
      try {
        const { data, error } = await supabase.rpc("check_rate_limit", {
          p_identifier: ip,
          p_identifier_type: "ip",
          p_endpoint: config.endpoint,
          p_max_requests: config.maxRequests,
          p_window_seconds: config.windowSeconds,
        });

        if (error) {
          logger.error("Rate limit check error:", error);
          // On error, allow the request but log it
          return {
            allowed: true,
            remaining: config.maxRequests - 1,
            resetIn: config.windowSeconds,
            blocked: false,
          };
        }

        const result = data as {
          allowed: boolean;
          current_count: number;
          max_requests: number;
          remaining?: number;
          retry_after_seconds?: number;
        };

        return {
          allowed: result.allowed,
          remaining: result.remaining || 0,
          resetIn: result.retry_after_seconds || config.windowSeconds,
          blocked: !result.allowed,
        };
      } catch (error) {
        logger.error("Rate limit check failed:", error);
        return {
          allowed: true,
          remaining: config.maxRequests - 1,
          resetIn: config.windowSeconds,
          blocked: false,
        };
      }
    },
    [getClientIP]
  );

  const checkAuthRateLimit = useCallback(async (): Promise<RateLimitResult> => {
    return checkRateLimit({
      maxRequests: 5,
      windowSeconds: 60,
      endpoint: "auth",
    });
  }, [checkRateLimit]);

  const checkAPIRateLimit = useCallback(async (): Promise<RateLimitResult> => {
    return checkRateLimit({
      maxRequests: 100,
      windowSeconds: 60,
      endpoint: "api",
    });
  }, [checkRateLimit]);

  const checkSensitiveRateLimit = useCallback(async (): Promise<RateLimitResult> => {
    return checkRateLimit({
      maxRequests: 3,
      windowSeconds: 300,
      endpoint: "sensitive",
    });
  }, [checkRateLimit]);

  const isBlocked = useCallback(async (): Promise<boolean> => {
    const ip = await getClientIP();

    try {
      const { data, error } = await supabase.rpc("is_ip_blocked", {
        p_ip_address: ip,
      });

      if (error) {
        logger.error("Block check error:", error);
        return false;
      }

      return !!data;
    } catch {
      return false;
    }
  }, [getClientIP]);

  return {
    checkRateLimit,
    checkAuthRateLimit,
    checkAPIRateLimit,
    checkSensitiveRateLimit,
    isBlocked,
    getClientIP,
  };
}
