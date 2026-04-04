import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

// ============================================================
// FormField - Text/number/email/password input with label
// ============================================================

interface FormInputProps {
  name: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  description?: string;
  className?: string;
}

export function FormInput({
  name,
  label,
  type = 'text',
  value,
  onChange,
  required,
  placeholder,
  disabled,
  error,
  description,
  className,
}: FormInputProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(error && 'border-destructive')}
        aria-describedby={error ? `${name}-error` : description ? `${name}-desc` : undefined}
        aria-invalid={!!error}
      />
      {description && !error && (
        <p id={`${name}-desc`} className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && (
        <p id={`${name}-error`} className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}

// ============================================================
// FormTextarea - Multi-line text with label
// ============================================================

interface FormTextareaProps {
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  rows?: number;
  className?: string;
}

export function FormTextarea({
  name,
  label,
  value,
  onChange,
  required,
  placeholder,
  disabled,
  error,
  rows = 3,
  className,
}: FormTextareaProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={cn(error && 'border-destructive')}
        aria-invalid={!!error}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ============================================================
// FormSelect - Dropdown with label
// ============================================================

interface FormSelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  name: string;
  label: string;
  options: FormSelectOption[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function FormSelect({
  name,
  label,
  options,
  value,
  onChange,
  required,
  placeholder,
  disabled,
  error,
  className,
}: FormSelectProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={name} className={cn(error && 'border-destructive')} aria-invalid={!!error}>
          <SelectValue placeholder={placeholder || `Selecione ${label.toLowerCase()}...`} />
        </SelectTrigger>
        <SelectContent>
          {options.map(o => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ============================================================
// FormSwitch - Toggle with label
// ============================================================

interface FormSwitchProps {
  name: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  description?: string;
  className?: string;
}

export function FormSwitch({
  name,
  label,
  checked,
  onChange,
  disabled,
  description,
  className,
}: FormSwitchProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <div className="space-y-0.5">
        <Label htmlFor={name}>{label}</Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <Switch id={name} checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}

// ============================================================
// FormSection - Group related fields
// ============================================================

interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div>
          {title && <h3 className="text-sm font-semibold">{title}</h3>}
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

// ============================================================
// FormRow - Horizontal layout for fields
// ============================================================

interface FormRowProps {
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
}

export function FormRow({ children, cols = 2, className }: FormRowProps) {
  const gridCls = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCls[cols], className)}>
      {children}
    </div>
  );
}
