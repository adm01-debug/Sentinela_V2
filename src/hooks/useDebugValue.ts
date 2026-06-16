import { useDebugValue as useReactDebugValue } from "react";

export function useDebugValue<T>(value: T, formatter?: (value: T) => string) {
  useReactDebugValue(value, formatter);
  return value;
}
