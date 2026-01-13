import { useState, useCallback } from "react";

interface ErrorState {
  error: Error | null;
  hasError: boolean;
}

export function useErrorState() {
  const [state, setState] = useState<ErrorState>({ error: null, hasError: false });

  const setError = useCallback((error: Error | string | null) => {
    if (error === null) {
      setState({ error: null, hasError: false });
    } else if (typeof error === "string") {
      setState({ error: new Error(error), hasError: true });
    } else {
      setState({ error, hasError: true });
    }
  }, []);

  const clearError = useCallback(() => {
    setState({ error: null, hasError: false });
  }, []);

  return { ...state, setError, clearError };
}
