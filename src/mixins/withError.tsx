import React, { ComponentType } from 'react';
import { AlertCircle } from 'lucide-react';
interface WithErrorProps { error?: Error | null; onRetry?: () => void; }
export function withError<P extends object>(Component: ComponentType<P>) {
  return function WithErrorComponent({ error, onRetry, ...props }: P & WithErrorProps) {
    if (error) return <div className="flex flex-col items-center justify-center p-8 text-center"><AlertCircle className="h-12 w-12 text-destructive mb-4" /><p className="text-lg font-medium">Algo deu errado</p><p className="text-muted-foreground">{error.message}</p>{onRetry && <button onClick={onRetry} className="mt-4 text-primary">Tentar novamente</button>}</div>;
    return <Component {...(props as P)} />;
  };
}
