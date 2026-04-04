// ============================================================
// SECURITY HEADERS - CSP & Meta Tags
// Applied via meta tags for SPA (no server config needed)
// ============================================================

/**
 * Inject security-related meta tags into the document head.
 * Called once at app startup from main.tsx.
 */
export function applySecurityHeaders(): void {
  const head = document.head;

  const metas: Record<string, string> = {
    // Prevent MIME-type sniffing
    'X-Content-Type-Options': 'nosniff',
    // Referrer policy - only send origin on cross-origin
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // Permissions policy - restrict powerful features
    'Permissions-Policy':
      'camera=(), microphone=(), geolocation=(self), payment=(), usb=()',
  };

  for (const [name, content] of Object.entries(metas)) {
    if (!head.querySelector(`meta[http-equiv="${name}"]`)) {
      const meta = document.createElement('meta');
      meta.httpEquiv = name;
      meta.content = content;
      head.appendChild(meta);
    }
  }

  // Content Security Policy via meta tag
  if (!head.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
    const csp = document.createElement('meta');
    csp.httpEquiv = 'Content-Security-Policy';
    csp.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.gpteng.co",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.mapbox.com https://cdn.gpteng.co",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');
    head.appendChild(csp);
  }
}
