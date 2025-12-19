/**
 * Security headers configuration for the application
 * These should be applied at the server/CDN level
 */

export const securityHeaders = {
  // Prevent clickjacking
  'X-Frame-Options': 'SAMEORIGIN',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS filter
  'X-XSS-Protection': '1; mode=block',
  
  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy (formerly Feature-Policy)
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=(self)',
    'payment=()',
  ].join(', '),
  
  // Strict Transport Security (HTTPS only)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

/**
 * Content Security Policy
 * Adjust based on your needs
 */
export const contentSecurityPolicy = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://api.mapbox.com'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://api.mapbox.com'],
  'img-src': ["'self'", 'data:', 'blob:', 'https://*.supabase.co', 'https://api.mapbox.com'],
  'font-src': ["'self'", 'data:'],
  'connect-src': [
    "'self'",
    'https://*.supabase.co',
    'wss://*.supabase.co',
    'https://api.mapbox.com',
    'https://events.mapbox.com',
  ],
  'frame-ancestors': ["'self'"],
  'form-action': ["'self'"],
  'base-uri': ["'self'"],
  'object-src': ["'none'"],
};

/**
 * Generate CSP header string
 */
export function generateCSPHeader(): string {
  return Object.entries(contentSecurityPolicy)
    .map(([directive, values]) => `${directive} ${values.join(' ')}`)
    .join('; ');
}

/**
 * Rate limiting configuration
 */
export const rateLimitConfig = {
  // Default rate limits
  default: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
  },
  
  // Strict rate limits for auth endpoints
  auth: {
    windowMs: 60 * 1000,
    max: 10, // 10 attempts per minute
  },
  
  // API rate limits
  api: {
    windowMs: 60 * 1000,
    max: 60, // 60 requests per minute
  },
};

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return input.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Check if request is from allowed origin
 */
export function isAllowedOrigin(origin: string, allowedOrigins: string[]): boolean {
  return allowedOrigins.some(allowed => {
    if (allowed === '*') return true;
    if (allowed.startsWith('*.')) {
      const domain = allowed.slice(2);
      return origin.endsWith(domain);
    }
    return origin === allowed;
  });
}
