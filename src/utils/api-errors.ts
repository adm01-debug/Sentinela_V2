import { toast } from 'sonner';

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

export const handleApiError = (error: unknown, context?: string) => {
  console.error(`API Error [${context || 'Unknown'}]:`, error);

  const err = error as
    | { error?: { code?: string; message?: string; details?: ValidationErrorDetail[] }; message?: string }
    | null
    | undefined;

  // Handle Supabase function 422 errors
  if (err && typeof err === 'object' && err.error && err.error.code === 'VALIDATION_ERROR') {
    const details = err.error.details as ValidationErrorDetail[];
    if (details && details.length > 0) {
      const fieldErrors = details.map(d => `${d.field}: ${d.message}`).join(', ');
      toast.error(`Erro de validação: ${fieldErrors}`, {
        duration: 5000,
      });
      return;
    }
  }

  // Handle generic error message
  const message = err?.message || err?.error?.message || 'Ocorreu um erro inesperado. Tente novamente.';
  toast.error(message);
};

export const isValidationError = (error: unknown): error is ApiErrorResponse => {
  const err = error as { error?: { code?: string } } | null | undefined;
  return Boolean(
    err &&
    typeof err === 'object' &&
    err.error &&
    err.error.code === 'VALIDATION_ERROR'
  );
};
