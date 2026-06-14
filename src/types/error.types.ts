export type ErrorCode = 
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_EXPIRED_TOKEN'
  | 'AUTH_UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR';

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
  status?: number;
}

export interface ApiError extends AppError {
  status: number;
}

export interface ValidationError extends ApiError {
  fields: Record<string, string[]>;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export interface ErrorLogEntry {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  userId?: string;
}

export type Severity = 'low' | 'medium' | 'high' | 'critical';
