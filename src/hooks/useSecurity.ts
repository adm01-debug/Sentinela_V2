import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

// ============================================================
// TYPES
// ============================================================

interface SecurityEvent {
  type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'session_expired' | 'suspicious_activity';
  timestamp: Date;
  details?: string;
  ip?: string;
  userAgent?: string;
}

interface SecurityState {
  lastActivity: Date;
  sessionStarted: Date;
  isIdle: boolean;
  activeSessions: number;
}

// ============================================================
// CONSTANTS
// ============================================================

const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const SESSION_WARNING = 5 * 60 * 1000; // 5 minutes before timeout
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart'];

// ============================================================
// HOOK
// ============================================================

export function useSecurity() {
  const { user, session, logout: signOut } = useAuth() as { user: { id: string; email: string } | null; session: unknown; logout: () => Promise<void> };
  const { toast } = useToast();
  const [securityState, setSecurityState] = useState<SecurityState>({
    lastActivity: new Date(),
    sessionStarted: new Date(),
    isIdle: false,
    activeSessions: 1,
  });
  const [showIdleWarning, setShowIdleWarning] = useState(false);

  // ============================================================
  // ACTIVITY TRACKING
  // ============================================================

  const updateActivity = useCallback(() => {
    setSecurityState(prev => ({
      ...prev,
      lastActivity: new Date(),
      isIdle: false,
    }));
    setShowIdleWarning(false);
  }, []);

  // Track user activity
  useEffect(() => {
    if (!user) return;

    ACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      ACTIVITY_EVENTS.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, [user, updateActivity]);

  // ============================================================
  // IDLE DETECTION
  // ============================================================

  useEffect(() => {
    if (!user) return;

    const checkIdle = setInterval(() => {
      const now = new Date();
      const timeSinceActivity = now.getTime() - securityState.lastActivity.getTime();

      // Show warning before timeout
      if (timeSinceActivity >= IDLE_TIMEOUT - SESSION_WARNING && !securityState.isIdle) {
        setShowIdleWarning(true);
        toast({
          title: 'Sessão expirando',
          description: 'Você será desconectado por inatividade em 5 minutos',
          variant: 'destructive',
        });
      }

      // Auto logout after idle timeout
      if (timeSinceActivity >= IDLE_TIMEOUT) {
        setSecurityState(prev => ({ ...prev, isIdle: true }));
        signOut();
        toast({
          title: 'Sessão expirada',
          description: 'Você foi desconectado por inatividade',
          variant: 'destructive',
        });
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkIdle);
  }, [user, securityState.lastActivity, securityState.isIdle, signOut, toast]);

  // ============================================================
  // SECURITY CHECKS
  // ============================================================

  // Check if session token is still valid
  const validateSession = useCallback(async (): Promise<boolean> => {
    if (!session) return false;

    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        return false;
      }

      // Check if session is expired
      const expiresAt = data.session.expires_at;
      if (expiresAt && expiresAt * 1000 < Date.now()) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }, [session]);

  // Log security event
  const logSecurityEvent = useCallback(async (event: SecurityEvent) => {
    // In production, you would send this to your security logs
    if (import.meta.env.DEV) {
      logger.info('[Security Event]', event);
    }
    
    // Could also be sent to an edge function for logging
  }, []);

  // ============================================================
  // CSRF PROTECTION
  // ============================================================

  const generateCSRFToken = useCallback((): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }, []);

  // ============================================================
  // SANITIZATION
  // ============================================================

  const sanitizeInput = useCallback((input: unknown): string => {
    return String(input ?? '')
      .replace(/[<>]/g, '') // Remove HTML brackets
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }, []);

  const sanitizeHTML = useCallback((html: string): string => {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }, []);

  // ============================================================
  // RETURN
  // ============================================================

  return {
    securityState,
    showIdleWarning,
    updateActivity,
    validateSession,
    logSecurityEvent,
    generateCSRFToken,
    sanitizeInput,
    sanitizeHTML,
    isSecure: !!session && !securityState.isIdle,
  };
}

// ============================================================
// SECURITY UTILITIES
// ============================================================

/**
 * Check if request is from a secure context
 */
export function isSecureContext(): boolean {
  return window.isSecureContext ?? window.location.protocol === 'https:';
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  errors: string[];
} {
  const errors: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else errors.push('Mínimo 8 caracteres');

  if (password.length >= 12) score++;

  if (/[a-z]/.test(password)) score++;
  else errors.push('Precisa de letra minúscula');

  if (/[A-Z]/.test(password)) score++;
  else errors.push('Precisa de letra maiúscula');

  if (/[0-9]/.test(password)) score++;
  else errors.push('Precisa de número');

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else errors.push('Recomenda-se caractere especial');

  return {
    isValid: errors.length <= 1 && password.length >= 8,
    score,
    errors,
  };
}

/**
 * Generate secure random string
 */
export function generateSecureRandom(length = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash sensitive data (client-side, for non-critical operations)
 */
export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}
