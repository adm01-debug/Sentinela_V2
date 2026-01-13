export interface AppError { code: ErrorCode; message: string; details?: Record<string, any>; stack?: string; timestamp: string; }
export type ErrorCode = 'AUTH_ERROR' | 'VALIDATION_ERROR' | 'NOT_FOUND' | 'FORBIDDEN' | 'RATE_LIMITED' | 'SERVER_ERROR' | 'NETWORK_ERROR' | 'TIMEOUT';
export interface ValidationError { field: string; message: string; code: string; }
export interface ApiError { status: number; code: ErrorCode; message: string; errors?: ValidationError[]; requestId?: string; }
export interface ErrorBoundaryState { hasError: boolean; error?: Error; errorInfo?: React.ErrorInfo; }
export interface ErrorLogEntry { id: string; error: AppError; userId?: string; url: string; userAgent: string; createdAt: string; }
