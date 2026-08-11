import { memo } from 'react';
import { AlertCircle, Inbox, Loader2, RefreshCw, ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================================
// LOADING STATE
// ============================================================
interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const DataLoading = memo(function DataLoading({
  message = 'Carregando dados...',
  className,
  size = 'md',
}: LoadingStateProps) {
  const sizeMap = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };
  const textMap = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 gap-3', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeMap[size])} />
      <p className={cn('text-muted-foreground', textMap[size])}>{message}</p>
    </div>
  );
});

// ============================================================
// EMPTY STATE
// ============================================================
interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const DataEmpty = memo(function DataEmpty({
  title = 'Nenhum dado encontrado',
  description = 'Não há registros para exibir no momento.',
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 gap-4', className)}>
      <div className="rounded-full bg-muted p-4">
        {icon || <Inbox className="h-8 w-8 text-muted-foreground" />}
      </div>
      <div className="text-center">
        <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">{description}</p>
      </div>
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
});

// ============================================================
// ERROR STATE
// ============================================================
interface ErrorStateProps {
  title?: string;
  description?: string;
  error?: Error | null;
  onRetry?: () => void;
  className?: string;
}

export const DataError = memo(function DataError({
  title = 'Erro ao carregar dados',
  description,
  error,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 gap-4', className)}>
      <div className="rounded-full bg-destructive/10 p-4">
        <ServerCrash className="h-8 w-8 text-destructive" />
      </div>
      <div className="text-center">
        <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          {description || error?.message || 'Ocorreu um erro inesperado. Tente novamente.'}
        </p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
});

// ============================================================
// UNIFIED DATA STATE WRAPPER
// ============================================================
interface DataStateProps {
  isLoading: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  onRetry?: () => void;
  children: React.ReactNode;
  loadingMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  emptyAction?: { label: string; onClick: () => void };
  className?: string;
}

export const DataState = memo(function DataState({
  isLoading,
  error,
  isEmpty,
  onRetry,
  children,
  loadingMessage,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  emptyAction,
  className,
}: DataStateProps) {
  if (isLoading) {
    return <DataLoading message={loadingMessage} className={className} />;
  }

  if (error) {
    return <DataError error={error} onRetry={onRetry} className={className} />;
  }

  if (isEmpty) {
    return (
      <DataEmpty
        title={emptyTitle}
        description={emptyDescription}
        icon={emptyIcon}
        action={emptyAction}
        className={className}
      />
    );
  }

  return <>{children}</>;
});
