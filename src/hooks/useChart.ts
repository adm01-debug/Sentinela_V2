import { useMemo } from "react";

interface ChartData {
  labels: string[];
  datasets: { label: string; data: number[]; color?: string }[];
}

export function useChart<T extends Record<string, unknown>>(
  data: T[],
  labelKey: keyof T,
  valueKey: keyof T
) {
  return useMemo(
    (): ChartData => ({
      labels: data.map((item) => String(item[labelKey])),
      datasets: [
        {
          label: String(valueKey),
          data: data.map((item) => Number(item[valueKey]) || 0),
        },
      ],
    }),
    [data, labelKey, valueKey]
  );
}
