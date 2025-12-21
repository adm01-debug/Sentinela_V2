import { useState, useCallback, ChangeEvent } from 'react';
export function useField<T = string>(initial: T) {
  const [value, setValue] = useState(initial);
  const [touched, setTouched] = useState(false);
  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value as T), []);
  const onBlur = useCallback(() => setTouched(true), []);
  return { value, onChange, onBlur, touched, setValue };
}