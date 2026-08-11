import { useMemo, useCallback } from "react";

export function useDateFormat(locale = "en-US") {
  const formatters = useMemo(() => ({
    short: new Intl.DateTimeFormat(locale, { dateStyle: "short" }),
    medium: new Intl.DateTimeFormat(locale, { dateStyle: "medium" }),
    long: new Intl.DateTimeFormat(locale, { dateStyle: "long" }),
    full: new Intl.DateTimeFormat(locale, { dateStyle: "full" }),
    time: new Intl.DateTimeFormat(locale, { timeStyle: "short" }),
    datetime: new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" })
  }), [locale]);

  const format = useCallback((date: Date, style: keyof typeof formatters = "medium") => {
    return formatters[style].format(date);
  }, [formatters]);

  return { format, formatters };
}
