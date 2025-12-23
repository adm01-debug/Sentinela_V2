export const validationRules = {
  isRequired: (value: any): boolean => value !== null && value !== undefined && value !== '',
  minLength: (value: string, min: number): boolean => value.length >= min,
  maxLength: (value: string, max: number): boolean => value.length <= max,
  isEmail: (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  isUrl: (value: string): boolean => { try { new URL(value); return true; } catch { return false; } },
  isNumber: (value: any): boolean => !isNaN(parseFloat(value)) && isFinite(value),
  isInRange: (value: number, min: number, max: number): boolean => value >= min && value <= max,
  matches: (value: string, pattern: RegExp): boolean => pattern.test(value),
};
