import * as React from 'react';
import { Input as BaseInput, InputProps } from './input';
import { Label } from './label';

interface A11yInputProps extends InputProps {
  label: string;
  error?: string;
  hint?: string;
}

export const A11yInput = React.forwardRef<HTMLInputElement, A11yInputProps>(
  ({ label, error, hint, id, ...props }, ref) => {
    const inputId = id || `input-${React.useId()}`;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div className="space-y-2">
        <Label htmlFor={inputId}>{label}</Label>
        <BaseInput
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={[error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined}
          {...props}
        />
        {hint && <p id={hintId} className="text-sm text-muted-foreground">{hint}</p>}
        {error && <p id={errorId} className="text-sm text-destructive" role="alert">{error}</p>}
      </div>
    );
  }
);

A11yInput.displayName = 'A11yInput';
