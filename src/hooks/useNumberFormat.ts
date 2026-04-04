import { useMemo, useCallback } from "react";

export function useNumberFormat(locale = "en-US", options?: Intl.NumberFormatOptions) {
  const formatter = useMemo(() => new Intl.NumberFormat(locale, options), [locale, options]);

  const format = useCallback((value) => formatter.format(value), [formatter]);
  const formatCompact = useCallback((value) => {
    return new Intl.NumberFormat(locale, { ...options, notation: "compact" }).format(value);
  }, [locale, options]);

  return { format, formatCompact };
}
