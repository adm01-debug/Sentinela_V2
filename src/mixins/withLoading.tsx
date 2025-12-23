import React, { ComponentType } from 'react';
import { Loader2 } from 'lucide-react';
interface WithLoadingProps { isLoading?: boolean; }
export function withLoading<P extends object>(Component: ComponentType<P>) {
  return function WithLoadingComponent({ isLoading, ...props }: P & WithLoadingProps) {
    if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    return <Component {...(props as P)} />;
  };
}
