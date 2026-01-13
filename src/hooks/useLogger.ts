import { useCallback, useRef } from "react";

type LogLevel = "debug" | "info" | "warn" | "error";

export function useLogger(prefix = "App") {
  const logCount = useRef(0);

  const log = useCallback((level: LogLevel, message: string, data?: unknown) => {
    logCount.current++;
    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] [${prefix}] [${level.toUpperCase()}] ${message}`;
    
    const fn = console[level] || console.log;
    data ? fn(formatted, data) : fn(formatted);
  }, [prefix]);

  const debug = useCallback((msg: string, data?: unknown) => log("debug", msg, data), [log]);
  const info = useCallback((msg: string, data?: unknown) => log("info", msg, data), [log]);
  const warn = useCallback((msg: string, data?: unknown) => log("warn", msg, data), [log]);
  const error = useCallback((msg: string, data?: unknown) => log("error", msg, data), [log]);

  return { log, debug, info, warn, error, logCount: logCount.current };
}
