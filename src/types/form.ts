// Form types for Sentinela v17
import { ValidationError } from "./common";

export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  hidden?: boolean;
  defaultValue?: unknown;
  validation?: FieldValidation;
  options?: FieldOption[];
  dependencies?: FieldDependency[];
  conditionalRender?: ConditionalRender;
  layout?: FieldLayout;
}

export type FormFieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "textarea"
  | "select"
  | "multiselect"
  | "checkbox"
  | "radio"
  | "switch"
  | "date"
  | "time"
  | "datetime"
  | "daterange"
  | "file"
  | "image"
  | "color"
  | "slider"
  | "rating"
  | "autocomplete"
  | "tags"
  | "richtext"
  | "code"
  | "json"
  | "custom";

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
  email?: boolean;
  url?: boolean;
  custom?: (value) => string | undefined;
}

export interface FieldOption {
  value: string | number | boolean;
  label: string;
  disabled?: boolean;
  icon?: string;
  description?: string;
}

export interface FieldDependency {
  field: string;
  operator: "eq" | "ne" | "in" | "nin" | "gt" | "lt";
  value: unknown;
  action: "show" | "hide" | "enable" | "disable" | "require";
}

export interface ConditionalRender {
  when: string;
  is: unknown;
  then: Partial<FormField>;
  otherwise?: Partial<FormField>;
}

export interface FieldLayout {
  column?: number;
  row?: number;
  colSpan?: number;
  rowSpan?: number;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export interface FormConfig {
  id: string;
  title?: string;
  description?: string;
  sections: FormSection[];
  layout: FormLayout;
  submitLabel?: string;
  cancelLabel?: string;
  resetLabel?: string;
  showReset?: boolean;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface FormLayout {
  columns: number;
  gap?: number;
  labelPosition?: "top" | "left" | "inline";
  labelWidth?: number | string;
}

export interface FormState<T = Record<string, unknown>> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValidating: boolean;
  isValid: boolean;
  isDirty: boolean;
  submitCount: number;
}

export interface FormActions<T = Record<string, unknown>> {
  setValue: (name: keyof T, value: number) => void;
  setValues: (values: Partial<T>) => void;
  setError: (name: keyof T, error: string) => void;
  setErrors: (errors: Record<string, string>) => void;
  setTouched: (name: keyof T, touched: boolean) => void;
  reset: (values?: Partial<T>) => void;
  validate: () => Promise<boolean>;
  submit: () => Promise<void>;
}

export interface FormSubmitResult<T = unknown> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

export type FormMode = "create" | "edit" | "view" | "clone";

export interface DynamicFormProps<T = Record<string, unknown>> {
  config: FormConfig;
  initialValues?: Partial<T>;
  mode?: FormMode;
  onSubmit: (values: T) => Promise<FormSubmitResult>;
  onChange?: (values: T) => void;
  onCancel?: () => void;
}
