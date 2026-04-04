import { useMemo, useCallback } from "react";

export function useCurrencyFormat(locale = "en-US", currency = "USD") {
  const formatter = useMemo(() => {
    return new Intl.NumberFormat(locale, { style: "currency", currency });
  }, [locale, currency]);

  const format = useCallback((value: number) => formatter.format(value), [formatter]);

  const parse = useCallback((str: string) => {
    return parseFloat(str.replace(/[^0-9.-]+/g, ""));
  }, []);

  return { format, parse };
}
