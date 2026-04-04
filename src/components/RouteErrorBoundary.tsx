import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { captureError } from '@/lib/errorTracker';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    errorTracker.capture(error, {
      component: errorInfo.componentStack?.slice(0, 500) || 'unknown',
      severity: 'error',
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex items-center justify-center min-h-[60vh] p-6">
          <Card className="max-w-lg w-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="rounded-full bg-destructive/10 p-4">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-card-foreground">
                    Algo deu errado
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ocorreu um erro inesperado ao carregar esta página.
                  </p>
                </div>

                {import.meta.env.DEV && this.state.error && (
                  <details className="w-full text-left">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                      Detalhes técnicos
                    </summary>
                    <pre className="mt-2 p-3 rounded-lg bg-muted text-xs overflow-auto max-h-40 text-muted-foreground">
                      {this.state.error.message}
                      {this.state.errorInfo?.componentStack?.slice(0, 300)}
                    </pre>
                  </details>
                )}

                <div className="flex gap-3 mt-2">
                  <Button variant="outline" onClick={this.handleGoHome} className="gap-2">
                    <Home className="h-4 w-4" />
                    Início
                  </Button>
                  <Button onClick={this.handleRetry} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Tentar novamente
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
