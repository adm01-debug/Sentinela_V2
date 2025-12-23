import { useState, useCallback } from 'react';
import { ZodSchema } from 'zod';

export function useFormValidation<T>(schema: ZodSchema<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback((data: unknown): data is T => {
    const result = schema.safeParse(data);
    if (result.success) {
      setErrors({});
      return true;
    }
    const newErrors: Record<string, string> = {};
    result.error.errors.forEach(err => {
      newErrors[err.path.join('.')] = err.message;
    });
    setErrors(newErrors);
    return false;
  }, [schema]);

  const clearError = useCallback((field: string) => {
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  }, []);

  return { errors, validate, clearError, hasErrors: Object.keys(errors).length > 0 };
}
