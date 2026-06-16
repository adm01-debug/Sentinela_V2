import { useState, useCallback, useMemo } from "react";

export function useBoolean(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue((v) => !v), []);

  return useMemo(
    () => ({
      value,
      setValue,
      setTrue,
      setFalse,
      toggle,
    }),
    [value, setTrue, setFalse, toggle]
  );
}
