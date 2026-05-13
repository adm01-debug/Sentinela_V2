import { useMemo, useCallback } from "react";

export function useNumberFormat(locale = "en-US", options?: Intl.NumberFormatOptions) {
  const formatter = useMemo(() => new Intl.NumberFormat(locale, options), [locale, options]);

  const format = useCallback((value: any) => formatter.format(value: any), [formatter]);
  const formatCompact = useCallback((value: any) => {
    return new Intl.NumberFormat(locale, { ...options, notation: "compact" }).format(value: any);
  }, [locale, options]);

  return { format, formatCompact };
}
