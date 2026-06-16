import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { captureError } from "@/lib/errorTracker";
import { queryClient } from "@/lib/queryClient";

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
    captureError(error, {
      component: "RouteErrorBoundary",
      context: { componentStack: errorInfo.componentStack?.slice(0, 500) },
      severity: "high",
    });
  }

  handleRetry = () => {
    queryClient.clear();
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[60vh] items-center justify-center p-6">
          <Card className="w-full max-w-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="rounded-full bg-destructive/10 p-4">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-card-foreground">Algo deu errado</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ocorreu um erro inesperado ao carregar esta página.
                  </p>
                </div>

                {import.meta.env.DEV && this.state.error && (
                  <details className="w-full text-left">
                    <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                      Detalhes técnicos
                    </summary>
                    <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                      {this.state.error.message}
                      {this.state.errorInfo?.componentStack?.slice(0, 300)}
                    </pre>
                  </details>
                )}

                <div className="mt-2 flex gap-3">
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
