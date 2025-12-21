import { useState, useCallback, FormEvent } from 'react';
export function useForm<T extends Record<string, unknown>>(initial: T, onSubmit: (d: T) => void) {
  const [values, setValues] = useState(initial);
  const handleChange = useCallback((n: keyof T, v: unknown) => setValues(p => ({ ...p, [n]: v })), []);
  const handleSubmit = useCallback((e: FormEvent) => { e.preventDefault(); onSubmit(values); }, [values, onSubmit]);
  return { values, handleChange, handleSubmit };
}