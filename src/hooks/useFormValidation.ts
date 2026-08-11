import { useState, useCallback } from 'react';
type ValidationRule<V> = { validate: (value: V) => boolean; message: string };
type FieldRules<T> = Record<keyof T, ValidationRule<T[keyof T]>[]>;
export function useFormValidation<T extends Record<string, unknown>>(rules: Partial<FieldRules<T>>) {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const validateField = useCallback((field: keyof T, value: T[keyof T]) => {
    const fieldRules = rules[field] || [];
    for (const rule of fieldRules) {
      if (!rule.validate(value)) { setErrors(prev => ({ ...prev, [field]: rule.message })); return false; }
    }
    setErrors(prev => { const { [field]: _, ...rest } = prev; return rest as Partial<Record<keyof T, string>>; });
    return true;
  }, [rules]);
  const validateAll = useCallback((data: T) => {
    let isValid = true;
    const newErrors: Partial<Record<keyof T, string>> = {};
    Object.keys(rules).forEach(field => {
      const fieldRules = rules[field as keyof T] || [];
      for (const rule of fieldRules) {
        if (!rule.validate(data[field as keyof T])) { newErrors[field as keyof T] = rule.message; isValid = false; break; }
      }
    });
    setErrors(newErrors);
    return isValid;
  }, [rules]);
  return { errors, validateField, validateAll, clearErrors: () => setErrors({}) };
}
export default useFormValidation;
