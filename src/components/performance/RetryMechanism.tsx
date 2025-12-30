import React, { useState, useCallback, useEffect, memo } from 'react';
import { RefreshCw, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Types
export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
}

export interface RetryState {
  attempt: number;
  isRetrying: boolean;
  lastError: Error | null;
  nextRetryAt: Date | null;
  succeeded: boolean;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
};

// Calculate delay with exponential backoff
function calculateDelay(attempt: number, config: RetryConfig): number {
  const delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.maxDelay);
}

// Check if error is retryable
function isRetryableError(error: Error, retryableErrors?: string[]): boolean {
  if (!retryableErrors) return true;
  return retryableErrors.some(
    (msg) => error.message.toLowerCase().includes(msg.toLowerCase())
  );
}

// Hook for retry logic
export function useRetry<T>(
  asyncFn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const [state, setState] = useState<RetryState>({
    attempt: 0,
    isRetrying: false,
    lastError: null,
    nextRetryAt: null,
    succeeded: false,
  });

  const execute = useCallback(async (): Promise<T | null> => {
    setState((prev) => ({
      ...prev,
      attempt: 0,
      isRetrying: true,
      lastError: null,
      succeeded: false,
    }));

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
      setState((prev) => ({ ...prev, attempt }));

      try {
        const result = await asyncFn();
        setState((prev) => ({
          ...prev,
          isRetrying: false,
          succeeded: true,
          lastError: null,
        }));
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Check if we should retry
        if (
          attempt < finalConfig.maxAttempts &&
          isRetryableError(lastError, finalConfig.retryableErrors)
        ) {
          const delay = calculateDelay(attempt, finalConfig);
          const nextRetryAt = new Date(Date.now() + delay);

          setState((prev) => ({
            ...prev,
            lastError,
            nextRetryAt,
          }));

          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    setState((prev) => ({
      ...prev,
      isRetrying: false,
      lastError,
      nextRetryAt: null,
    }));

    return null;
  }, [asyncFn, finalConfig]);

  const reset = useCallback(() => {
    setState({
      attempt: 0,
      isRetrying: false,
      lastError: null,
      nextRetryAt: null,
      succeeded: false,
    });
  }, []);

  return {
    execute,
    reset,
    ...state,
    maxAttempts: finalConfig.maxAttempts,
  };
}

// Visual component for retry status
interface RetryStatusProps {
  attempt: number;
  maxAttempts: number;
  isRetrying: boolean;
  lastError: Error | null;
  nextRetryAt: Date | null;
  succeeded: boolean;
  onRetry?: () => void;
  onCancel?: () => void;
  className?: string;
}

function RetryStatusComponent({
  attempt,
  maxAttempts,
  isRetrying,
  lastError,
  nextRetryAt,
  succeeded,
  onRetry,
  onCancel,
  className,
}: RetryStatusProps) {
  const [countdown, setCountdown] = useState<number | null>(null);

  // Countdown timer
  useEffect(() => {
    if (!nextRetryAt) {
      setCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const remaining = Math.max(0, nextRetryAt.getTime() - Date.now());
      setCountdown(Math.ceil(remaining / 1000));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 100);
    return () => clearInterval(interval);
  }, [nextRetryAt]);

  if (succeeded) {
    return (
      <div className={cn('flex items-center gap-2 text-green-600', className)}>
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm">Sucesso!</span>
      </div>
    );
  }

  if (!isRetrying && !lastError) {
    return null;
  }

  return (
    <div
      className={cn(
        'p-4 rounded-lg border bg-card',
        lastError && !isRetrying ? 'border-destructive/30' : 'border-border',
        className
      )}
    >
      {isRetrying ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm font-medium">
                Tentativa {attempt} de {maxAttempts}
              </span>
            </div>
            {onCancel && (
              <Button variant="ghost" size="sm" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>

          <Progress value={(attempt / maxAttempts) * 100} className="h-1.5" />

          {countdown !== null && countdown > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Próxima tentativa em {countdown}s</span>
            </div>
          )}

          {lastError && (
            <p className="text-xs text-muted-foreground truncate">
              Erro: {lastError.message}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Falha após {maxAttempts} tentativas</span>
          </div>

          {lastError && (
            <p className="text-sm text-muted-foreground">{lastError.message}</p>
          )}

          {onRetry && (
            <Button onClick={onRetry} size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export const RetryStatus = memo(RetryStatusComponent);

// Wrapper component that auto-retries
interface RetryWrapperProps<T> {
  asyncFn: () => Promise<T>;
  children: (data: T) => React.ReactNode;
  loadingComponent?: React.ReactNode;
  config?: Partial<RetryConfig>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function RetryWrapper<T>({
  asyncFn,
  children,
  loadingComponent,
  config,
  onSuccess,
  onError,
}: RetryWrapperProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const retry = useRetry(asyncFn, config);

  useEffect(() => {
    retry.execute().then((result) => {
      if (result !== null) {
        setData(result);
        onSuccess?.(result);
      } else if (retry.lastError) {
        onError?.(retry.lastError);
      }
    });
  }, []);

  if (data !== null) {
    return <>{children(data)}</>;
  }

  if (retry.isRetrying && loadingComponent) {
    return <>{loadingComponent}</>;
  }

  return (
    <RetryStatus
      {...retry}
      onRetry={() => retry.execute().then((result) => result && setData(result))}
    />
  );
}

// Simple retry button
interface RetryButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function RetryButton({
  onClick,
  isLoading,
  className,
  children,
}: RetryButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className={cn('gap-2', className)}
    >
      <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
      {children || 'Tentar novamente'}
    </Button>
  );
}

export default RetryStatus;
