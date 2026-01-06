// Authentication utility functions
export const authUtils = {
  // Generate secure random token
  generateToken: (length = 32): string => {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  },

  // Hash password client-side (for display/comparison only, actual hashing on server)
  hashForDisplay: async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
  },

  // Validate email format
  isValidEmail: (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),

  // Password strength checker
  getPasswordStrength: (password: string): { score: number; feedback: string[] } => {
    const feedback: string[] = [];
    let score = 0;
    
    if (password.length >= 8) score += 1; else feedback.push('At least 8 characters');
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password)) score += 1; else feedback.push('Add lowercase letter');
    if (/[A-Z]/.test(password)) score += 1; else feedback.push('Add uppercase letter');
    if (/[0-9]/.test(password)) score += 1; else feedback.push('Add number');
    if (/[^a-zA-Z0-9]/.test(password)) score += 1; else feedback.push('Add special character');
    
    return { score: Math.min(score, 5), feedback };
  },

  // Parse JWT (without verification - for display only)
  parseJWT: (token: string): { header: any; payload: any } | null => {
    try {
      const [headerB64, payloadB64] = token.split('.');
      return {
        header: JSON.parse(atob(headerB64)),
        payload: JSON.parse(atob(payloadB64))
      };
    } catch { return null; }
  },

  // Check if token is expired
  isTokenExpired: (token: string): boolean => {
    const parsed = authUtils.parseJWT(token);
    if (!parsed?.payload?.exp) return true;
    return Date.now() >= parsed.payload.exp * 1000;
  },

  // Get device info for session tracking
  getDeviceInfo: () => ({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cookiesEnabled: navigator.cookieEnabled,
  }),

  // Sanitize user input
  sanitize: (input: string): string => input.replace(/[<>"'&]/g, c => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;' }[c] || c)),
};

export default authUtils;
