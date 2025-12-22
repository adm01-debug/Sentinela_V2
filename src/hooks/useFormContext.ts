import { createContext, useContext } from 'react';

interface FormContextValue {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  setValue: (name: string, value: unknown) => void;
  setError: (name: string, error: string) => void;
}

const FormContext = createContext<FormContextValue | null>(null);

export function useFormContext() {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error('useFormContext must be used within FormProvider');
  return ctx;
}

export { FormContext };