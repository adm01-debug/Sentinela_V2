import { AppError } from "./AppError";

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    statusCode: number;
    errors?: Record<string, string[]>;
  };
}

export function handleError(error: unknown): ErrorResponse {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        ...(error as any).errors && { errors: (error as any).errors },
      },
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: {
        message: process.env.NODE_ENV === "production" 
          ? "An unexpected error occurred" 
          : error.message,
        code: "INTERNAL_ERROR",
        statusCode: 500,
      },
    };
  }

  return {
    success: false,
    error: {
      message: "An unexpected error occurred",
      code: "UNKNOWN_ERROR",
      statusCode: 500,
    },
  };
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
