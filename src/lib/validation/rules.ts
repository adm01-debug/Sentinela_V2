export const rules = {
  required: (value: unknown) => value !== null && value !== undefined && value !== '',
  email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  minLength: (min: number) => (value: string) => value.length >= min,
  maxLength: (max: number) => (value: string) => value.length <= max,
  min: (min: number) => (value: number) => value >= min,
  max: (max: number) => (value: number) => value <= max,
  pattern: (regex: RegExp) => (value: string) => regex.test(value),
  match: (field: string, values: Record<string, unknown>) => (value: unknown) => value === values[field],
};
export const messages = {
  required: 'This field is required',
  email: 'Please enter a valid email',
  minLength: (min: number) => 'Must be at least ' + min + ' characters',
  maxLength: (max: number) => 'Must be at most ' + max + ' characters',
  min: (min: number) => 'Must be at least ' + min,
  max: (max: number) => 'Must be at most ' + max,
  pattern: 'Invalid format',
  match: (field: string) => 'Must match ' + field,
};
