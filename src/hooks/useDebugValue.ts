import { useDebugValue as useReactDebugValue } from "react";

export function useDebugValue<T>(value) => string) {
  useReactDebugValue(value, formatter);
  return value;
}
