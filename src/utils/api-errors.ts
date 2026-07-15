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

  // Handle Supabase function 422 errors
  if (error && typeof error === 'object' && error.error && error.error.code === 'VALIDATION_ERROR') {
    const details = error.error.details as ValidationErrorDetail[];
    if (details && details.length > 0) {
      const fieldErrors = details.map(d => `${d.field}: ${d.message}`).join(', ');
      toast.error(`Erro de validação: ${fieldErrors}`, {
        duration: 5000,
      });
      return;
    }
  }

  // Handle generic error message
  const message = error?.message || error?.error?.message || 'Ocorreu um erro inesperado. Tente novamente.';
  toast.error(message);
};

export const isValidationError = (error: unknown): error is ApiErrorResponse => {
  return (
    error &&
    typeof error === 'object' &&
    error.error &&
    error.error.code === 'VALIDATION_ERROR'
  );
};
