import { useState, useCallback, ChangeEvent } from "react";

export function useInput(initialValue = "") {
  const [value, setValue] = useState(initialValue);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValue(e.target.value);
  }, []);

  const reset = useCallback(() => setValue(initialValue), [initialValue]);
  const clear = useCallback(() => setValue(""), []);

  return {
    value,
    setValue,
    onChange,
    reset,
    clear,
    bind: { value, onChange }
  };
}
