import React, { useState, useCallback, useEffect, memo, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, Check, AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Types
export type OptimisticState = 'idle' | 'pending' | 'success' | 'error';

export interface OptimisticAction<T> {
  id: string;
  type: string;
  data: T;
  optimisticData: T;
  state: OptimisticState;
  error?: Error;
  timestamp: number;
  rollback?: () => void;
}

// Context for global optimistic state
interface OptimisticContextType {
  pendingActions: OptimisticAction<unknown>[];
  addAction: <T>(action: Omit<OptimisticAction<T>, 'timestamp'>) => void;
  updateAction: (id: string, updates: Partial<OptimisticAction<unknown>>) => void;
  removeAction: (id: string) => void;
  rollbackAction: (id: string) => void;
}

const OptimisticContext = createContext<OptimisticContextType | null>(null);

export function OptimisticProvider({ children }: { children: React.ReactNode }) {
  const [pendingActions, setPendingActions] = useState<OptimisticAction<unknown>[]>([]);

  const addAction = useCallback(<T,>(action: Omit<OptimisticAction<T>, 'timestamp'>) => {
    setPendingActions((prev) => [
      ...prev,
      { ...action, timestamp: Date.now() } as OptimisticAction<unknown>,
    ]);
  }, []);

  const updateAction = useCallback(
    (id: string, updates: Partial<OptimisticAction<unknown>>) => {
      setPendingActions((prev) =>
        prev.map((action) =>
          action.id === id ? { ...action, ...updates } : action
        )
      );
    },
    []
  );

  const removeAction = useCallback((id: string) => {
    setPendingActions((prev) => prev.filter((action) => action.id !== id));
  }, []);

  const rollbackAction = useCallback((id: string) => {
    const action = pendingActions.find((a) => a.id === id);
    if (action?.rollback) {
      action.rollback();
    }
    removeAction(id);
  }, [pendingActions, removeAction]);

  return (
    <OptimisticContext.Provider
      value={{ pendingActions, addAction, updateAction, removeAction, rollbackAction }}
    >
      {children}
    </OptimisticContext.Provider>
  );
}

export function useOptimistic() {
  const context = useContext(OptimisticContext);
  if (!context) {
    throw new Error('useOptimistic must be used within OptimisticProvider');
  }
  return context;
}

// Hook for optimistic mutations
export function useOptimisticMutation<TData, TVariables>({
  mutationFn,
  onSuccess,
  onError,
  onSettled,
  getOptimisticData,
  rollbackFn,
}: {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: () => void;
  getOptimisticData?: (variables: TVariables) => TData;
  rollbackFn?: () => void;
}) {
  const [state, setState] = useState<OptimisticState>('idle');
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (variables: TVariables) => {
      setState('pending');
      setError(null);

      // Apply optimistic update
      if (getOptimisticData) {
        setData(getOptimisticData(variables));
      }

      try {
        const result = await mutationFn(variables);
        setState('success');
        setData(result);
        onSuccess?.(result, variables);

        // Auto-reset to idle after success
        setTimeout(() => setState('idle'), 2000);

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setState('error');
        setError(error);
        onError?.(error, variables);

        // Rollback optimistic update
        rollbackFn?.();
        setData(null);

        throw error;
      } finally {
        onSettled?.();
      }
    },
    [mutationFn, onSuccess, onError, onSettled, getOptimisticData, rollbackFn]
  );

  const reset = useCallback(() => {
    setState('idle');
    setData(null);
    setError(null);
  }, []);

  return {
    mutate,
    state,
    data,
    error,
    reset,
    isIdle: state === 'idle',
    isPending: state === 'pending',
    isSuccess: state === 'success',
    isError: state === 'error',
  };
}

// Status indicator component
interface OptimisticStatusProps {
  state: OptimisticState;
  successMessage?: string;
  errorMessage?: string;
  onRetry?: () => void;
  className?: string;
}

function OptimisticStatusComponent({
  state,
  successMessage = 'Salvo!',
  errorMessage = 'Erro ao salvar',
  onRetry,
  className,
}: OptimisticStatusProps) {
  if (state === 'idle') return null;

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm animate-in fade-in duration-200',
        className
      )}
    >
      {state === 'pending' && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Salvando...</span>
        </>
      )}

      {state === 'success' && (
        <>
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-green-600">{successMessage}</span>
        </>
      )}

      {state === 'error' && (
        <>
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-destructive">{errorMessage}</span>
          {onRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="h-6 px-2 text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Tentar novamente
            </Button>
          )}
        </>
      )}
    </div>
  );
}

export const OptimisticStatus = memo(OptimisticStatusComponent);

// Optimistic list wrapper
interface OptimisticListItemProps {
  isPending?: boolean;
  isError?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function OptimisticListItem({
  isPending,
  isError,
  children,
  className,
}: OptimisticListItemProps) {
  return (
    <div
      className={cn(
        'transition-all duration-200',
        isPending && 'opacity-70',
        isError && 'border-l-2 border-l-destructive bg-destructive/5',
        className
      )}
    >
      {children}
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
    </div>
  );
}

// Auto-save indicator
interface AutoSaveIndicatorProps {
  lastSaved?: Date;
  isSaving?: boolean;
  hasError?: boolean;
  className?: string;
}

export function AutoSaveIndicator({
  lastSaved,
  isSaving,
  hasError,
  className,
}: AutoSaveIndicatorProps) {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (lastSaved) {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastSaved]);

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-xs text-muted-foreground',
        className
      )}
    >
      {isSaving && (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Salvando...</span>
        </>
      )}

      {!isSaving && hasError && (
        <>
          <AlertCircle className="h-3 w-3 text-destructive" />
          <span className="text-destructive">Erro ao salvar</span>
        </>
      )}

      {!isSaving && !hasError && showSaved && (
        <>
          <Check className="h-3 w-3 text-green-600" />
          <span className="text-green-600">Salvo</span>
        </>
      )}

      {!isSaving && !hasError && !showSaved && lastSaved && (
        <span>
          Salvo às {lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  );
}

export default OptimisticStatus;
