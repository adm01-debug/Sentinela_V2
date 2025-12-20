// ============================================================
// RATE LIMITING MODULE
// Shared rate limiting utilities for Edge Functions
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// ============================================================
// TYPES
// ============================================================

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}

// ============================================================
// IN-MEMORY RATE LIMITER (for Edge Functions)
// ============================================================

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimitInMemory(
  identifier: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  
  let entry = rateLimitStore.get(key);
  
  // Reset if window expired
  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + windowMs };
    rateLimitStore.set(key, entry);
  }
  
  // Increment count
  entry.count++;
  
  const allowed = entry.count <= maxRequests;
  const remaining = Math.max(0, maxRequests - entry.count);
  const resetAt = new Date(entry.resetAt);
  const retryAfter = allowed ? undefined : Math.ceil((entry.resetAt - now) / 1000);
  
  return { allowed, remaining, resetAt, retryAfter };
}

// ============================================================
// BACKWARD COMPATIBLE ALIAS
// ============================================================

/**
 * Legacy function name for backward compatibility
 * @deprecated Use checkRateLimitInMemory instead
 */
export async function checkRateLimit(
  identifier: string,
  endpoint: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const key = `${endpoint}:${identifier}`;
  return checkRateLimitInMemory(key, maxRequests, windowSeconds * 1000);
}

// ============================================================
// DATABASE-BACKED RATE LIMITER
// ============================================================

export async function checkRateLimitDB(
  supabaseUrl: string,
  supabaseKey: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { maxRequests, windowMs, identifier } = config;
  
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);
  
  try {
    // Count requests in window
    const { count, error } = await supabase
      .from('rate_limit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('identifier', identifier)
      .gte('created_at', windowStart.toISOString());
    
    if (error) {
      console.error('Rate limit check error:', error);
      // Fail open if DB error
      return { allowed: true, remaining: maxRequests, resetAt: now };
    }
    
    const currentCount = count || 0;
    const allowed = currentCount < maxRequests;
    const remaining = Math.max(0, maxRequests - currentCount - 1);
    const resetAt = new Date(now.getTime() + windowMs);
    
    // Log request if allowed
    if (allowed) {
      await supabase.from('rate_limit_logs').insert({
        identifier,
        identifier_type: 'ip',
        endpoint: config.identifier.split(':')[0],
        created_at: now.toISOString(),
      });
    }
    
    return {
      allowed,
      remaining,
      resetAt,
      retryAfter: allowed ? undefined : Math.ceil(windowMs / 1000),
    };
  } catch (err) {
    console.error('Rate limit error:', err);
    // Fail open
    return { allowed: true, remaining: maxRequests, resetAt: now };
  }
}

// ============================================================
// RATE LIMIT RESPONSE HELPERS
// ============================================================

export function rateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: result.retryAfter,
      resetAt: result.resetAt.toISOString(),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': result.resetAt.toISOString(),
        'Retry-After': String(result.retryAfter || 60),
      },
    }
  );
}

export function addRateLimitHeaders(
  response: Response,
  result: RateLimitResult
): Response {
  const headers = new Headers(response.headers);
  headers.set('X-RateLimit-Remaining', String(result.remaining));
  headers.set('X-RateLimit-Reset', result.resetAt.toISOString());
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// ============================================================
// PRESET RATE LIMITS
// ============================================================

export const RATE_LIMITS = {
  // WhatsApp: 30 messages per minute per user
  WHATSAPP: { maxRequests: 30, windowMs: 60 * 1000 },
  
  // Violation alerts: 100 per minute per company
  VIOLATION_ALERT: { maxRequests: 100, windowMs: 60 * 1000 },
  
  // OCR: 10 per minute per user (expensive operation)
  OCR: { maxRequests: 10, windowMs: 60 * 1000 },
  
  // Reports: 5 per hour per user
  REPORT: { maxRequests: 5, windowMs: 60 * 60 * 1000 },
  
  // Agent collector: 60 per minute per device
  AGENT: { maxRequests: 60, windowMs: 60 * 1000 },
  
  // Mobile collector: 120 per minute per device
  MOBILE: { maxRequests: 120, windowMs: 60 * 1000 },
  
  // Webhooks: 100 per minute per company
  WEBHOOK: { maxRequests: 100, windowMs: 60 * 1000 },
} as const;

// ============================================================
// EASY-TO-USE WRAPPER
// ============================================================

export function createRateLimiter(presetOrConfig: keyof typeof RATE_LIMITS | { maxRequests: number; windowMs: number }) {
  const config = typeof presetOrConfig === 'string' 
    ? RATE_LIMITS[presetOrConfig] 
    : presetOrConfig;
    
  return {
    check: (identifier: string) => checkRateLimitInMemory(
      identifier,
      config.maxRequests,
      config.windowMs
    ),
    config,
  };
}
