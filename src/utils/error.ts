import { logger } from '@/lib/logger';
export class AppError extends Error { constructor(message: string, public code: string, public details?: unknown) { super(message); this.name = 'AppError'; } }
export const isAppError = (error): error is AppError => error instanceof AppError;
export const getErrorMessage = (error): string => { if (error instanceof Error) return error.message; if (typeof error === 'string') return error; return 'An unknown error occurred'; };
export const handleError = (error, fallback = 'Something went wrong') => { logger.error(getErrorMessage(error)); return getErrorMessage(error) || fallback; };
