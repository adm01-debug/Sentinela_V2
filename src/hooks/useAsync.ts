import { useState, useCallback, useEffect, useRef } from 'react';

// ============================================================
// TYPES
// ============================================================

type AsyncStatus = 'idle' | 'pending' | 'success' | 'error';

interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  error: Error | null;
  isIdle: boolean;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
}

interface UseAsyncReturn<T> extends AsyncState<T> {
  execute: (...args: unknown[]) => Promise<T>;
  reset: () => void;
}

// ============================================================
// useAsync - Execute async functions
// ============================================================

/**
 * Hook for handling async function execution with status tracking
 * @param asyncFunction - The async function to execute
 * @param immediate - Whether to execute immediately on mount
 */
export function useAsync<T>(
  asyncFunction: (...args: unknown[]) => Promise<T>,
  immediate = false
): UseAsyncReturn<T> {
  const [state, setState] = useState<AsyncState<T>>({
    status: 'idle',
    data: null,
    error: null,
    isIdle: true,
    isPending: false,
    isSuccess: false,
    isError: false,
  });

  const isMounted = useRef(true);

  const execute = useCallback(
    async (...args: unknown[]): Promise<T> => {
      setState({
        status: 'pending',
        data: null,
        error: null,
        isIdle: false,
        isPending: true,
        isSuccess: false,
        isError: false,
      });

      try {
        const result = await asyncFunction(...args);
        
        if (isMounted.current) {
          setState({
            status: 'success',
            data: result,
            error: null,
            isIdle: false,
            isPending: false,
            isSuccess: true,
            isError: false,
          });
        }
        
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        
        if (isMounted.current) {
          setState({
            status: 'error',
            data: null,
            error: err,
            isIdle: false,
            isPending: false,
            isSuccess: false,
            isError: true,
          });
        }
        
        throw err;
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      data: null,
      error: null,
      isIdle: true,
      isPending: false,
      isSuccess: false,
      isError: false,
    });
  }, []);

  useEffect(() => {
    isMounted.current = true;
    
    if (immediate) {
      execute();
    }

    return () => {
      isMounted.current = false;
    };
  }, [execute, immediate]);

  return { ...state, execute, reset };
}

// ============================================================
// useAsyncCallback - For event handlers
// ============================================================

/**
 * Like useAsync but returns a stable callback
 */
export function useAsyncCallback<T, Args extends unknown[]>(
  asyncFunction: (...args: Args) => Promise<T>
): [(...args: Args) => Promise<T>, AsyncState<T>] {
  const [state, setState] = useState<AsyncState<T>>({
    status: 'idle',
    data: null,
    error: null,
    isIdle: true,
    isPending: false,
    isSuccess: false,
    isError: false,
  });

  const execute = useCallback(
    async (...args: Args): Promise<T> => {
      setState({
        status: 'pending',
        data: null,
        error: null,
        isIdle: false,
        isPending: true,
        isSuccess: false,
        isError: false,
      });

      try {
        const result = await asyncFunction(...args);
        
        setState({
          status: 'success',
          data: result,
          error: null,
          isIdle: false,
          isPending: false,
          isSuccess: true,
          isError: false,
        });
        
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        
        setState({
          status: 'error',
          data: null,
          error: err,
          isIdle: false,
          isPending: false,
          isSuccess: false,
          isError: true,
        });
        
        throw err;
      }
    },
    [asyncFunction]
  );

  return [execute, state];
}

// ============================================================
// useAsyncRetry - With retry functionality
// ============================================================

interface UseAsyncRetryReturn<T> extends UseAsyncReturn<T> {
  retry: () => Promise<T>;
  retryCount: number;
}

/**
 * useAsync with retry functionality
 */
export function useAsyncRetry<T>(
  asyncFunction: () => Promise<T>,
  maxRetries = 3,
  retryDelay = 1000
): UseAsyncRetryReturn<T> {
  const [retryCount, setRetryCount] = useState(0);
  const { execute, reset, ...state } = useAsync(asyncFunction);

  const retry = useCallback(async (): Promise<T> => {
    if (retryCount >= maxRetries) {
      throw new Error('Max retries exceeded');
    }

    setRetryCount((prev) => prev + 1);

    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const result = await execute();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, retryDelay * retryCount);
    });
  }, [execute, retryCount, maxRetries, retryDelay]);

  const fullReset = useCallback(() => {
    reset();
    setRetryCount(0);
  }, [reset]);

  return { ...state, execute, reset: fullReset, retry, retryCount };
}
