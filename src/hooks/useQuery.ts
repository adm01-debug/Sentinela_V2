import { useState, useEffect, useCallback } from "react";

interface QueryState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

export function useQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  options?: { enabled?: boolean; refetchInterval?: number }
) {
  const { enabled = true, refetchInterval } = options || {};
  const [state, setState] = useState<QueryState<T>>({
    data: null,
    error: null,
    isLoading: true,
    isError: false,
    isSuccess: false,
  });

  const fetch = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const data = await queryFn();
      setState({ data, error: null, isLoading: false, isError: false, isSuccess: true });
    } catch (error) {
      setState((s) => ({
        ...s,
        error: error as Error,
        isLoading: false,
        isError: true,
        isSuccess: false,
      }));
    }
  }, [queryFn]);

  useEffect(() => {
    if (!enabled) return;
    fetch();

    if (refetchInterval) {
      const timer = setInterval(fetch, refetchInterval);
      return () => clearInterval(timer);
    }
  }, [fetch, enabled, refetchInterval]);

  return { ...state, refetch: fetch };
}
