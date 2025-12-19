import { memo, useCallback } from 'react';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from './ErrorBoundary';

interface QueryErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function QueryErrorFallbackComponent({ error, resetErrorBoundary }: QueryErrorFallbackProps) {
  const isNetworkError = error.message.includes('fetch') || 
                         error.message.includes('network') ||
                         error.message.includes('Failed to fetch');

  const Icon = isNetworkError ? WifiOff : AlertTriangle;
  const title = isNetworkError ? 'Erro de conexão' : 'Erro ao carregar dados';
  const description = isNetworkError 
    ? 'Não foi possível conectar ao servidor. Verifique sua conexão.'
    : 'Ocorreu um erro ao carregar os dados. Tente novamente.';

  return (
    <div className="min-h-[300px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <Icon className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={resetErrorBoundary}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

const QueryErrorFallback = memo(QueryErrorFallbackComponent);

interface QueryErrorBoundaryProps {
  children: React.ReactNode;
}

export function QueryErrorBoundary({ children }: QueryErrorBoundaryProps) {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <ErrorBoundary
      onError={() => {
        // Could log to error tracking service
      }}
      fallback={undefined}
    >
      <QueryErrorBoundaryInner reset={reset}>
        {children}
      </QueryErrorBoundaryInner>
    </ErrorBoundary>
  );
}

// Inner component to handle the reset
function QueryErrorBoundaryInner({ 
  children, 
  reset 
}: { 
  children: React.ReactNode; 
  reset: () => void;
}) {
  const handleReset = useCallback(() => {
    reset();
    window.location.reload();
  }, [reset]);

  return (
    <ErrorBoundaryWithReset onReset={handleReset}>
      {children}
    </ErrorBoundaryWithReset>
  );
}

// Simple error boundary with reset capability
class ErrorBoundaryWithReset extends React.Component<
  { children: React.ReactNode; onReset: () => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; onReset: () => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <QueryErrorFallback
          error={this.state.error}
          resetErrorBoundary={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

import React from 'react';
