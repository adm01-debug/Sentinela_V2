import { useState, useCallback } from 'react';
export function useValidation<T>(rules: Record<keyof T, (v: unknown) => string | null>) {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const validate = useCallback((data: T) => { const errs: Partial<Record<keyof T, string>> = {}; let valid = true; for (const key in rules) { const err = rules[key](data[key]); if (err) { errs[key] = err; valid = false; } } setErrors(errs); return valid; }, [rules]);
  return { errors, validate, clearErrors: () => setErrors({}) };
}