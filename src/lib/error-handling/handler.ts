import { logger } from '@/utils/logger';
export interface AppError { code: string; message: string; details?: unknown; stack?: string; }
export const handleError = (error: unknown): AppError => {
  if (error instanceof Error) {
    logger.error(error.message, { stack: error.stack });
    return { code: 'UNKNOWN_ERROR', message: error.message, stack: error.stack };
  }
  return { code: 'UNKNOWN_ERROR', message: 'An unexpected error occurred' };
};
export const isNetworkError = (error: unknown): boolean => error instanceof TypeError && error.message.includes('fetch');
export const isAuthError = (error: unknown): boolean => error instanceof Error && (error.message.includes('401') || error.message.includes('Unauthorized'));
export const createError = (code: string, message: string, details?: unknown): AppError => ({ code, message, details });
