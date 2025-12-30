import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: unknown[];
  showDetails?: boolean;
  variant?: 'full' | 'inline' | 'minimal';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundaryEnhanced extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset error state when resetKeys change
    if (
      this.state.hasError &&
      this.props.resetKeys &&
      prevProps.resetKeys &&
      this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys![index]
      )
    ) {
      this.reset();
    }
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
    });
  };

  handleCopyError = async () => {
    const { error, errorInfo } = this.state;
    const errorText = `
Error: ${error?.message}
Stack: ${error?.stack}
Component Stack: ${errorInfo?.componentStack}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorText);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch (err) {
      console.error('Failed to copy error:', err);
    }
  };

  render() {
    const { children, fallback, showDetails = true, variant = 'full' } = this.props;
    const { hasError, error, errorInfo, copied } = this.state;

    if (!hasError) {
      return children;
    }

    // Custom fallback
    if (fallback) {
      return fallback;
    }

    // Minimal variant
    if (variant === 'minimal') {
      return (
        <div className="flex items-center gap-2 p-4 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <span>Algo deu errado.</span>
          <Button variant="link" size="sm" onClick={this.reset} className="h-auto p-0">
            Tentar novamente
          </Button>
        </div>
      );
    }

    // Inline variant
    if (variant === 'inline') {
      return (
        <div className="flex flex-col items-center justify-center p-6 border border-destructive/20 rounded-lg bg-destructive/5">
          <AlertTriangle className="h-8 w-8 text-destructive mb-3" />
          <h3 className="font-semibold text-destructive mb-1">Erro ao carregar</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center">
            {error?.message || 'Ocorreu um erro inesperado'}
          </p>
          <Button onClick={this.reset} size="sm" variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      );
    }

    // Full variant
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <Card className="w-full max-w-lg border-destructive/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-xl">Algo deu errado</CardTitle>
            <CardDescription>
              Ocorreu um erro inesperado. Tente novamente ou volte para a página inicial.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {showDetails && error && (
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full gap-2">
                    <Bug className="h-4 w-4" />
                    Ver detalhes técnicos
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <div className="relative rounded-lg bg-muted p-4 font-mono text-xs overflow-x-auto">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={this.handleCopyError}
                    >
                      {copied ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                    <p className="text-destructive font-semibold mb-2">
                      {error.name}: {error.message}
                    </p>
                    {error.stack && (
                      <pre className="whitespace-pre-wrap text-muted-foreground text-[10px] max-h-40 overflow-y-auto">
                        {error.stack}
                      </pre>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </CardContent>

          <CardFooter className="flex gap-3 justify-center">
            <Button onClick={this.reset} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/')}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Ir para início
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
}

// Functional wrapper with hook for reset
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundaryEnhanced {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundaryEnhanced>
    );
  };
}

// Async error boundary for suspense
interface AsyncBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
  onError?: (error: Error) => void;
}

export function AsyncBoundary({
  children,
  fallback,
  loadingFallback,
  onError,
}: AsyncBoundaryProps) {
  return (
    <ErrorBoundaryEnhanced fallback={fallback} onError={onError ? (e) => onError(e) : undefined}>
      <React.Suspense fallback={loadingFallback || <DefaultLoadingFallback />}>
        {children}
      </React.Suspense>
    </ErrorBoundaryEnhanced>
  );
}

function DefaultLoadingFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
    </div>
  );
}

export default ErrorBoundaryEnhanced;
