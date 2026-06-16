export interface ThresholdLineProps {
  value: number;
  label?: string;
  color?: string;
  strokeDasharray?: string;
}

export function ThresholdLine({
  value,
  label,
  color = "hsl(var(--destructive))",
  strokeDasharray = "5 5",
}: ThresholdLineProps) {
  return { value, label, color, strokeDasharray };
}
