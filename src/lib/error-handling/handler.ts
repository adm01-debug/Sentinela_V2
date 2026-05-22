import { logger } from '@/lib/logger';

export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  stack?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export const handleError = (error: unknown): AppError => {
  if (error instanceof Error) {
    const severity = error.message.includes('auth') || error.message.includes('security') ? 'critical' : 'high';
    logger.error(`[AppError] ${error.message}`, { stack: error.stack, severity });
    return { 
      code: 'UNKNOWN_ERROR', 
      message: error.message, 
      stack: error.stack,
      severity 
    };
  }
  
  const msg = typeof error === 'string' ? error : 'An unexpected error occurred';
  logger.error(`[AppError] ${msg}`);
  return { code: 'UNKNOWN_ERROR', message: msg };
};

export const isNetworkError = (error: unknown): boolean => 
  error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Network'));

export const isAuthError = (error: unknown): boolean => 
  error instanceof Error && (
    error.message.includes('401') || 
    error.message.includes('Unauthorized') || 
    error.message.includes('JWT')
  );

export const createError = (code: string, message: string, details?: unknown, severity: AppError['severity'] = 'medium'): AppError => ({ 
  code, 
  message, 
  details,
  severity 
});
