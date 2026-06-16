import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/helpers";
import { useCountUp } from "@/hooks/useCountUp";

interface SparklineData {
  value: number;
}

interface Props {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: { value: number; label?: string };
  description?: string;
  iconColor?: string;
  sparklineData?: SparklineData[];
  sparklineColor?: string;
}

function parseNumericValue(value: string | number): {
  num: number;
  prefix: string;
  suffix: string;
  decimals: number;
  separator: string;
} {
  if (typeof value === "number") {
    return { num: value, prefix: "", suffix: "", decimals: 0, separator: "" };
  }

  const str = value.toString();
  // Match patterns like "128", "1,234", "87%", "$1,234"
  const match = str.match(/^([^0-9]*)([0-9][0-9.,]*)([^0-9]*)$/);
  if (!match) {
    return { num: 0, prefix: "", suffix: "", decimals: 0, separator: "" };
  }

  const prefix = match[1];
  const numStr = match[2];
  const suffix = match[3];
  const hasSeparator = numStr.includes(",");
  const hasDecimal = numStr.includes(".");
  const cleanNum = parseFloat(numStr.replace(/,/g, ""));
  const decimals = hasDecimal ? numStr.split(".")[1]?.length || 0 : 0;

  return { num: cleanNum, prefix, suffix, decimals, separator: hasSeparator ? "," : "" };
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  iconColor,
  sparklineData,
  sparklineColor,
}: Props) {
  const isPositive = trend && trend.value >= 0;

  const parsed = useMemo(() => parseNumericValue(value), [value]);
  const { ref, formatted } = useCountUp({
    end: parsed.num,
    duration: 900,
    decimals: parsed.decimals,
    prefix: parsed.prefix,
    suffix: parsed.suffix,
    separator: parsed.separator,
  });

  const resolvedSparkColor = sparklineColor || "hsl(var(--primary))";

  return (
    <Card variant="interactive" className="group relative overflow-hidden">
      {/* Subtle gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <CardContent className="relative p-5" ref={ref}>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {Icon && (
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                iconColor || "bg-primary/10 text-primary"
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>

        <div className="flex items-end justify-between gap-2">
          <div className="flex-1">
            <div className="text-2xl font-bold tracking-tight text-card-foreground">
              {parsed.num > 0 ? formatted : value}
            </div>

            {trend && (
              <div
                className={cn(
                  "mt-2 flex items-center text-xs font-medium",
                  isPositive ? "text-success" : "text-destructive"
                )}
              >
                {isPositive ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3" />
                )}
                <span>{Math.abs(trend.value)}%</span>
                {trend.label && (
                  <span className="ml-1 font-normal text-muted-foreground">{trend.label}</span>
                )}
              </div>
            )}
            {description && <p className="mt-2 text-xs text-muted-foreground">{description}</p>}
          </div>

          {/* Sparkline */}
          {sparklineData && sparklineData.length > 1 && (
            <div className="h-10 w-20 opacity-60 transition-opacity group-hover:opacity-100">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient
                      id={`spark-${title.replace(/\s/g, "")}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={resolvedSparkColor} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={resolvedSparkColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={resolvedSparkColor}
                    strokeWidth={1.5}
                    fill={`url(#spark-${title.replace(/\s/g, "")})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
