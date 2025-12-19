import { memo, ReactNode } from 'react';
import { UseFormReturn, FieldPath, FieldValues, Controller } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ============================================================
// TYPES
// ============================================================

interface BaseFieldProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

interface InputFieldProps<TFieldValues extends FieldValues> extends BaseFieldProps<TFieldValues> {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
}

interface TextareaFieldProps<TFieldValues extends FieldValues> extends BaseFieldProps<TFieldValues> {
  rows?: number;
}

interface SelectFieldProps<TFieldValues extends FieldValues> extends BaseFieldProps<TFieldValues> {
  options: { value: string; label: string }[];
}

interface CheckboxFieldProps<TFieldValues extends FieldValues> extends BaseFieldProps<TFieldValues> {}

interface SwitchFieldProps<TFieldValues extends FieldValues> extends BaseFieldProps<TFieldValues> {}

// ============================================================
// FIELD WRAPPER
// ============================================================

interface FieldWrapperProps {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
  htmlFor?: string;
}

function FieldWrapper({
  label,
  description,
  error,
  required,
  className,
  children,
  htmlFor,
}: FieldWrapperProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={htmlFor} className={cn(error && 'text-destructive')}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {children}
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

// ============================================================
// INPUT FIELD
// ============================================================

function InputFieldComponent<TFieldValues extends FieldValues>({
  form,
  name,
  label,
  description,
  placeholder,
  className,
  disabled,
  required,
  type = 'text',
}: InputFieldProps<TFieldValues>) {
  const { register, formState: { errors } } = form;
  const error = errors[name]?.message as string | undefined;

  return (
    <FieldWrapper
      label={label}
      description={description}
      error={error}
      required={required}
      className={className}
      htmlFor={name}
    >
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        {...register(name, { valueAsNumber: type === 'number' })}
        className={cn(error && 'border-destructive')}
      />
    </FieldWrapper>
  );
}

export const InputField = memo(InputFieldComponent) as typeof InputFieldComponent;

// ============================================================
// TEXTAREA FIELD
// ============================================================

function TextareaFieldComponent<TFieldValues extends FieldValues>({
  form,
  name,
  label,
  description,
  placeholder,
  className,
  disabled,
  required,
  rows = 4,
}: TextareaFieldProps<TFieldValues>) {
  const { register, formState: { errors } } = form;
  const error = errors[name]?.message as string | undefined;

  return (
    <FieldWrapper
      label={label}
      description={description}
      error={error}
      required={required}
      className={className}
      htmlFor={name}
    >
      <Textarea
        id={name}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        {...register(name)}
        className={cn(error && 'border-destructive')}
      />
    </FieldWrapper>
  );
}

export const TextareaField = memo(TextareaFieldComponent) as typeof TextareaFieldComponent;

// ============================================================
// SELECT FIELD
// ============================================================

function SelectFieldComponent<TFieldValues extends FieldValues>({
  form,
  name,
  label,
  description,
  placeholder,
  className,
  disabled,
  required,
  options,
}: SelectFieldProps<TFieldValues>) {
  const { control, formState: { errors } } = form;
  const error = errors[name]?.message as string | undefined;

  return (
    <FieldWrapper
      label={label}
      description={description}
      error={error}
      required={required}
      className={className}
    >
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            value={field.value}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger className={cn(error && 'border-destructive')}>
              <SelectValue placeholder={placeholder || 'Selecione...'} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </FieldWrapper>
  );
}

export const SelectField = memo(SelectFieldComponent) as typeof SelectFieldComponent;

// ============================================================
// CHECKBOX FIELD
// ============================================================

function CheckboxFieldComponent<TFieldValues extends FieldValues>({
  form,
  name,
  label,
  description,
  className,
  disabled,
}: CheckboxFieldProps<TFieldValues>) {
  const { control, formState: { errors } } = form;
  const error = errors[name]?.message as string | undefined;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className={cn('flex items-start space-x-3', className)}>
          <Checkbox
            id={name}
            checked={field.value}
            onCheckedChange={field.onChange}
            disabled={disabled}
          />
          <div className="space-y-1 leading-none">
            {label && (
              <Label htmlFor={name} className="cursor-pointer">
                {label}
              </Label>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        </div>
      )}
    />
  );
}

export const CheckboxField = memo(CheckboxFieldComponent) as typeof CheckboxFieldComponent;

// ============================================================
// SWITCH FIELD
// ============================================================

function SwitchFieldComponent<TFieldValues extends FieldValues>({
  form,
  name,
  label,
  description,
  className,
  disabled,
}: SwitchFieldProps<TFieldValues>) {
  const { control, formState: { errors } } = form;
  const error = errors[name]?.message as string | undefined;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className={cn('flex items-center justify-between', className)}>
          <div className="space-y-0.5">
            {label && <Label htmlFor={name}>{label}</Label>}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <Switch
            id={name}
            checked={field.value}
            onCheckedChange={field.onChange}
            disabled={disabled}
          />
        </div>
      )}
    />
  );
}

export const SwitchField = memo(SwitchFieldComponent) as typeof SwitchFieldComponent;
