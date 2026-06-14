export const logger = {
  error: (message: string, meta?: unknown) => console.error(`[ERROR] ${message}`, meta),
  warn: (message: string, meta?: unknown) => console.warn(`[WARN] ${message}`, meta),
  // eslint-disable-next-line no-console -- logger utility intentionally writes to console
  info: (message: string, meta?: unknown) => console.info(`[INFO] ${message}`, meta),
  // eslint-disable-next-line no-console -- logger utility intentionally writes to console
  debug: (message: string, meta?: unknown) => console.debug(`[DEBUG] ${message}`, meta),
};
