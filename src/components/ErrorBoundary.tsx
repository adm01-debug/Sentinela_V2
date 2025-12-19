import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// ============================================================
// TYPES
// ============================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'section' | 'widget';
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// ============================================================
// ERROR BOUNDARY COMPONENT
// ============================================================

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // TODO: Send to error tracking service (Sentry, etc.)
    // Sentry.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, level = 'section', showDetails = false } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Page level error - full screen
      if (level === 'page') {
        return (
          <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-lg">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <CardTitle className="text-2xl">Algo deu errado</CardTitle>
                <CardDescription>
                  Ocorreu um erro inesperado. Nossa equipe foi notificada.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {showDetails && error && (
                  <div className="rounded-lg bg-muted p-4 text-sm">
                    <p className="font-mono text-destructive">{error.message}</p>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={this.handleRetry} className="flex-1">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Tentar novamente
                  </Button>
                  <Button variant="outline" onClick={this.handleGoHome} className="flex-1">
                    <Home className="mr-2 h-4 w-4" />
                    Ir para início
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }

      // Section level error - card
      if (level === 'section') {
        return (
          <Card className="border-destructive/50">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold">Erro ao carregar seção</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Não foi possível carregar este conteúdo.
                  </p>
                </div>
                {showDetails && error && (
                  <p className="text-xs text-destructive font-mono bg-muted p-2 rounded">
                    {error.message}
                  </p>
                )}
                <Button size="sm" variant="outline" onClick={this.handleRetry}>
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Tentar novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      }

      // Widget level error - minimal
      return (
        <div className="flex items-center justify-center p-4 rounded-lg border border-destructive/30 bg-destructive/5">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <Bug className="h-4 w-4" />
            <span>Erro</span>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 px-2 text-xs"
              onClick={this.handleRetry}
            >
              Retry
            </Button>
          </div>
        </div>
      );
    }

    return children;
  }
}

// ============================================================
// WRAPPER COMPONENTS FOR DIFFERENT LEVELS
// ============================================================

export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary level="page" showDetails={process.env.NODE_ENV === 'development'}>
      {children}
    </ErrorBoundary>
  );
}

export function SectionErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary level="section">
      {children}
    </ErrorBoundary>
  );
}

export function WidgetErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary level="widget">
      {children}
    </ErrorBoundary>
  );
}

// ============================================================
// HOC FOR WRAPPING COMPONENTS
// ============================================================

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  level: 'page' | 'section' | 'widget' = 'section'
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary level={level}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default ErrorBoundary;
