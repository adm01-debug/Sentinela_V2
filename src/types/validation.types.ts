export interface ValidationRule { type: ValidationType; message?: string; value?: string | number | boolean | RegExp; }
export type ValidationType = 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url' | 'phone' | 'cpf' | 'cnpj' | 'custom';
export interface ValidationResult { isValid: boolean; errors: ValidationFieldError[]; }
export interface ValidationFieldError { field: string; type: ValidationType; message: string; }
export interface ValidationSchema { [field: string]: ValidationRule[]; }
export type Validator<T> = (value: T) => ValidationResult;
export interface AsyncValidationResult { isValid: boolean; errors: ValidationFieldError[]; pending: boolean; }
