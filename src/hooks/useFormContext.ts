import { createContext, useContext } from 'react';

interface FormContextValue {
  values: Record<string, any>;
  errors: Record<string, string>;
  setValue: (name: string, value: any) => void;
  setError: (name: string, error: string) => void;
}

const FormContext = createContext<FormContextValue | null>(null);

export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) throw new Error('useFormContext must be used within FormProvider');
  return context;
}

export { FormContext };
