import { useState, useCallback } from "react";

interface LoadingState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
}

export function useLoadingState() {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
  });

  const startLoading = useCallback(() => {
    setState({ isLoading: true, isSuccess: false, isError: false, error: null });
  }, []);

  const setSuccess = useCallback(() => {
    setState({ isLoading: false, isSuccess: true, isError: false, error: null });
  }, []);

  const setError = useCallback((error: Error) => {
    setState({ isLoading: false, isSuccess: false, isError: true, error });
  }, []);

  const reset = useCallback(() => {
    setState({ isLoading: false, isSuccess: false, isError: false, error: null });
  }, []);

  return { ...state, startLoading, setSuccess, setError, reset };
}
