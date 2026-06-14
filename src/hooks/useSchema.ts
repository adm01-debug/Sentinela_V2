import { useCallback } from "react";

interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

type Schema<T> = {
  [K in keyof T]?: {
    required?: boolean;
    type?: "string" | "number" | "boolean" | "object" | "array";
    min?: number;
    max?: number;
    pattern?: RegExp;
  };
};

export function useSchema<T extends Record<string, unknown>>(schema: Schema<T>) {
  const validate = useCallback((data: Record<string, unknown>): ValidationResult => {
    const errors: Record<string, string> = {};
    
    for (const [key, rules] of Object.entries(schema)) {
      const value = data[key];
      
      if (rules?.required && (value === undefined || value === null || value === "")) {
        errors[key] = `${key} is required`;
        continue;
      }
      
      if (rules?.type && typeof value !== rules.type) {
        errors[key] = `${key} must be a ${rules.type}`;
      }
      
      if (rules?.pattern && typeof value === "string" && !rules.pattern.test(value)) {
        errors[key] = `${key} format is invalid`;
      }
    }
    
    return { valid: Object.keys(errors).length === 0, errors };
  }, [schema]);

  return { validate };
}
