export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  status: number;
}

export interface ValidationError extends ApiError {
  fields: Record<string, string[]>;
}

export type Severity = 'low' | 'medium' | 'high' | 'critical';
