import { useState, useCallback } from "react";

interface RetryOptions {
  maxRetries?: number;
  delay?: number;
  backoff?: boolean;
}

export function useRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}) {
  const { maxRetries = 3, delay = 1000, backoff = true } = options;
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async (): Promise<T | null> => {
    setLoading(true);
    setError(null);

    for (let i = 0; i <= maxRetries; i++) {
      try {
        setAttempts(i + 1);
        const result = await fn();
        setLoading(false);
        return result;
      } catch (err) {
        if (i === maxRetries) {
          setError(err as Error);
          setLoading(false);
          return null;
        }
        await new Promise((r) => setTimeout(r, backoff ? delay * (i + 1) : delay));
      }
    }
    return null;
  }, [fn, maxRetries, delay, backoff]);

  return { execute, attempts, error, loading };
}
