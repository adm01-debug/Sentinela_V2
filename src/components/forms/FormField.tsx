import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea';
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  success?: string;
  hint?: string;
  tooltip?: string;
  maxLength?: number;
  className?: string;
  autoComplete?: string;
}

export function FormField({ label, name, type = 'text', value = '', onChange, placeholder, required, disabled, error, success, hint, tooltip, maxLength, className, autoComplete }: FormFieldProps) {
  const id = `field-${name}`;
  const hasError = !!error;
  const hasSuccess = !!success;
  const InputComponent = type === 'textarea' ? Textarea : Input;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className={cn(hasError && 'text-destructive')}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" /></TooltipTrigger>
              <TooltipContent><p>{tooltip}</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="relative">
        <InputComponent id={id} name={name} type={type !== 'textarea' ? type : undefined} value={value} onChange={(e: any) => onChange?.(e.target.value)} placeholder={placeholder} disabled={disabled} maxLength={maxLength} autoComplete={autoComplete} className={cn(hasError && 'border-destructive focus-visible:ring-destructive', hasSuccess && 'border-green-500 focus-visible:ring-green-500', (hasError || hasSuccess) && 'pr-10')} aria-invalid={hasError} aria-describedby={hasError ? `${id}-error` : hint ? `${id}-hint` : undefined} />
        {hasError && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />}
        {hasSuccess && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
      </div>
      {hasError && <p id={`${id}-error`} className="text-sm text-destructive">{error}</p>}
      {hasSuccess && <p className="text-sm text-green-600">{success}</p>}
      {hint && !hasError && <p id={`${id}-hint`} className="text-sm text-muted-foreground">{hint}</p>}
      {maxLength && <p className="text-xs text-muted-foreground text-right">{value.length}/{maxLength}</p>}
    </div>
  );
}
export default FormField;
