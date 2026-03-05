export const logger = {
  error: (message: string, meta?: unknown) => console.error(`[ERROR] ${message}`, meta),
  warn: (message: string, meta?: unknown) => console.warn(`[WARN] ${message}`, meta),
  info: (message: string, meta?: unknown) => console.info(`[INFO] ${message}`, meta),
  debug: (message: string, meta?: unknown) => console.debug(`[DEBUG] ${message}`, meta),
};
