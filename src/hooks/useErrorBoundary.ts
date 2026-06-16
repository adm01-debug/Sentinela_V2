import { useCallback } from "react";
import { logger } from "@/lib/logger";

export function useErrorBoundary() {
  const handleError = useCallback((error: Error, info?: { componentStack: string }) => {
    if (import.meta.env.DEV) {
      logger.error("[ErrorBoundary]", error, info?.componentStack);
    }
  }, []);

  return { handleError };
}
