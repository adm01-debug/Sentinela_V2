import { memo } from 'react';
import { Loader2, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

function LoadingSpinnerComponent({ size = 'md', className, text }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <Loader2 className={cn("animate-spin text-muted-foreground", sizeClasses[size])} />
      {text && <p className="text-sm text-muted-foreground mt-2">{text}</p>}
    </div>
  );
}

export const LoadingSpinner = memo(LoadingSpinnerComponent);

/**
 * Branded splash screen for initial app load / auth checks.
 * Shows the Sentinela logo with a subtle pulse animation.
 */
export function BrandedSplash() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
      <div className="relative">
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl animate-pulse" />
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
          <Shield className="h-8 w-8 text-white" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-foreground tracking-tight">Sentinela</h1>
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
    </div>
  );
}
