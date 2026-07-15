import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export interface ValidationErrorDetail {
  field: string;
  message: string;
  code: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: ValidationErrorDetail[];
  };
}

type MaybeApiError = { error?: { code?: string; message?: string; details?: ValidationErrorDetail[] }; message?: string };

export const handleApiError = (error: unknown, context?: string) => {
  logger.error(`API Error [${context || 'Unknown'}]:`, error);
  const e = (error ?? {}) as MaybeApiError;

  if (e.error?.code === 'VALIDATION_ERROR') {
    const details = e.error.details ?? [];
    if (details.length > 0) {
      const fieldErrors = details.map(d => `${d.field}: ${d.message}`).join(', ');
      toast.error(`Erro de validação: ${fieldErrors}`, { duration: 5000 });
      return;
    }
  }

  const message = e.message || e.error?.message || 'Ocorreu um erro inesperado. Tente novamente.';
  toast.error(message);
};

export const isValidationError = (error: unknown): error is ApiErrorResponse => {
  const e = error as MaybeApiError | null;
  return !!e && typeof e === 'object' && e.error?.code === 'VALIDATION_ERROR';
};
