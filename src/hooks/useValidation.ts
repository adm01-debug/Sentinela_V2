import { useState, useCallback } from 'react';
export function useValidation<T extends Record<string, unknown>>(rules: Partial<Record<keyof T, (v: T[keyof T]) => string | null>>) {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const validate = useCallback((data: T) => {
    const errs: Partial<Record<keyof T, string>> = {};
    let valid = true;
    for (const key in rules) {
      const rule = rules[key];
      if (!rule) continue;
      const err = rule(data[key]);
      if (err) { errs[key] = err; valid = false; }
    }
    setErrors(errs);
    return valid;
  }, [rules]);
  return { errors, validate, clearErrors: () => setErrors({}) };
}
