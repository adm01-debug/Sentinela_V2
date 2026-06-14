import { logger } from "@/lib/logger";

export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  stack?: string;
  severity?: "low" | "medium" | "high" | "critical";
}

interface ValidationErrorShape {
  error?: {
    code?: string;
    message?: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export const handleError = (error: unknown): AppError => {
  const validationError = error as ValidationErrorShape | null | undefined;
  if (validationError?.error?.code === "VALIDATION_ERROR") {
    const details = validationError.error.details || [];
    const fields = details.reduce<Record<string, string>>((acc, curr) => {
      acc[curr.field] = curr.message;
      return acc;
    }, {});

    return {
      code: "VALIDATION_ERROR",
      message: validationError.error.message || "Erro de validação nos campos informados.",
      details: fields,
      severity: "medium",
    };
  }

  if (error instanceof Error) {
    const severity =
      error.message.includes("auth") || error.message.includes("security") ? "critical" : "high";
    logger.error(`[AppError] ${error.message}`, { stack: error.stack, severity });
    return {
      code: "UNKNOWN_ERROR",
      message: error.message,
      stack: error.stack,
      severity,
    };
  }

  // Non-Error inputs (strings, numbers, null, plain objects) are not trusted as
  // user-facing messages — surface a consistent generic message instead.
  logger.error("[AppError] An unexpected error occurred", { received: error });
  return { code: "UNKNOWN_ERROR", message: "An unexpected error occurred" };
};

export const isNetworkError = (error: unknown): boolean =>
  error instanceof TypeError &&
  (error.message.includes("fetch") || error.message.includes("Network"));

export const isAuthError = (error: unknown): boolean =>
  error instanceof Error &&
  (error.message.includes("401") ||
    error.message.includes("Unauthorized") ||
    error.message.includes("JWT"));

export const createError = (
  code: string,
  message: string,
  details?: unknown,
  severity: AppError["severity"] = "medium"
): AppError => ({
  code,
  message,
  details,
  severity,
});
