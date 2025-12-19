import { ReactNode } from 'react';
import { UseFormRegister, FieldError, Path, FieldValues } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  register: UseFormRegister<T>;
  error?: FieldError;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date' | 'time' | 'textarea';
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  autoComplete?: string;
  children?: ReactNode;
}

export function FormField<T extends FieldValues>({
  name,
  label,
  register,
  error,
  type = 'text',
  placeholder,
  disabled = false,
  required = false,
  className,
  inputClassName,
  rows = 3,
  min,
  max,
  step,
  autoComplete,
  children,
}: FormFieldProps<T>) {
  const inputId = `field-${String(name)}`;

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={inputId} className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
        {label}
      </Label>
      
      {type === 'textarea' ? (
        <Textarea
          id={inputId}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={cn(
            error && 'border-destructive focus-visible:ring-destructive',
            inputClassName
          )}
          {...register(name)}
        />
      ) : (
        <Input
          id={inputId}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          autoComplete={autoComplete}
          className={cn(
            error && 'border-destructive focus-visible:ring-destructive',
            inputClassName
          )}
          {...register(name, {
            valueAsNumber: type === 'number',
          })}
        />
      )}
      
      {children}
      
      {error && (
        <p className="text-sm text-destructive">{error.message}</p>
      )}
    </div>
  );
}

// Componente para select com validação
interface FormSelectProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  register: UseFormRegister<T>;
  error?: FieldError;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function FormSelect<T extends FieldValues>({
  name,
  label,
  register,
  error,
  options,
  placeholder = 'Selecione...',
  disabled = false,
  required = false,
  className,
}: FormSelectProps<T>) {
  const selectId = `field-${String(name)}`;

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={selectId} className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
        {label}
      </Label>
      
      <select
        id={selectId}
        disabled={disabled}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive'
        )}
        {...register(name)}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="text-sm text-destructive">{error.message}</p>
      )}
    </div>
  );
}
