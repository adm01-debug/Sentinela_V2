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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-8 overflow-hidden">
      <div className="relative">
        {/* Glow rings */}
        <div className="absolute inset-0 rounded-2xl bg-primary/25 blur-2xl animate-pulse scale-150" />
        <div className="absolute inset-0 rounded-2xl bg-accent/20 blur-xl animate-pulse delay-700" />
        
        <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-2xl border border-white/10 overflow-hidden group">
          <Shield className="h-10 w-10 text-white animate-in zoom-in-50 duration-500" />
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
      
      <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
        <h1 className="text-2xl font-black text-foreground tracking-tighter uppercase italic">
          Sentinela<span className="text-primary not-italic">v2</span>
        </h1>
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm font-medium text-muted-foreground/80 tracking-widest uppercase">
            Autenticando acesso seguro
          </p>
          <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-[shimmer_2s_infinite_linear]" 
                 style={{ 
                   width: '40%',
                   backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                 }} 
            />
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
}
