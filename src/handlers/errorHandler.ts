import { BaseException } from '@/exceptions/BaseException';
export const errorHandler = {
  handle: (error: unknown): { message: string; code: number; details?: any } => { if (error instanceof BaseException) return error.toJSON(); if (error instanceof Error) return { message: error.message, code: 500 }; return { message: 'Unknown error', code: 500 }; },
  log: (error: unknown, context?: string) => { console.error('[Error]', context || '', error); },
  notify: (error: unknown, userId?: string) => { console.log('[Notify]', 'User:', userId, 'Error:', error); },
  isRetryable: (error: unknown): boolean => { if (error instanceof BaseException) return error.code >= 500; return false; },
};
