import React, { useEffect } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ButtonState = 'idle' | 'loading' | 'success' | 'error';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  state?: ButtonState;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  onComplete?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function AnimatedButton({
  children, state = 'idle', loadingText = 'Carregando...', successText = 'Sucesso!',
  errorText = 'Erro!', onComplete, variant = 'default', size = 'md', className, disabled, ...props
}: AnimatedButtonProps) {
  useEffect(() => {
    if (state === 'success' || state === 'error') {
      const timer = setTimeout(() => onComplete?.(), 2000);
      return () => clearTimeout(timer);
    }
  }, [state, onComplete]);

  const baseStyles = 'relative inline-flex items-center justify-center font-medium transition-all duration-300 rounded-md overflow-hidden';
  const variantStyles = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };
  const sizeStyles = { sm: 'h-8 px-3 text-xs', md: 'h-10 px-4 text-sm', lg: 'h-12 px-6 text-base' };
  const stateStyles = {
    idle: '', loading: 'cursor-wait opacity-80',
    success: 'bg-success text-success-foreground', error: 'bg-destructive text-destructive-foreground',
  };

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], stateStyles[state], className)}
      disabled={disabled || state === 'loading'}
      {...props}
    >
      {state === 'loading' && (
        <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />{loadingText}</span>
      )}
      {state === 'success' && (
        <span className="flex items-center gap-2 animate-in zoom-in-50 duration-200"><Check className="h-4 w-4" />{successText}</span>
      )}
      {state === 'error' && (
        <span className="flex items-center gap-2 animate-in zoom-in-50 duration-200"><X className="h-4 w-4" />{errorText}</span>
      )}
      {state === 'idle' && children}
    </button>
  );
}
