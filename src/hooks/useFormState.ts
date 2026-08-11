import { useState } from 'react';
export function useFormState() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  return { isSubmitting, setIsSubmitting, isValid, setIsValid, isDirty, setIsDirty };
}