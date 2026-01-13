import { useState, useCallback } from "react";

export function useFocusWithin() {
  const [isFocusWithin, setIsFocusWithin] = useState(false);

  const onFocus = useCallback(() => setIsFocusWithin(true), []);
  const onBlur = useCallback((e: React.FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsFocusWithin(false);
    }
  }, []);

  return { isFocusWithin, focusWithinProps: { onFocus, onBlur } };
}
