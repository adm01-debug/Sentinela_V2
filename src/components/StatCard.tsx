import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// ============================================================
// COUNT-UP HOOK
// ============================================================
function useCountUp(target: number, duration = 1200): number {
  const [current, setCurrent] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) {
      setCurrent(0);
      return;
    }
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return current;
}

// ============================================================
// ACCENT COLOR MAP
// ============================================================
type AccentColor = "primary" | "success" | "warning" | "destructive" | "info" | "accent";

const accentBorderMap: Record<AccentColor, string> = {
  primary: "border-l-primary",
  success: "border-l-success",
  warning: "border-l-warning",
  destructive: "border-l-destructive",
  info: "border-l-info",
  accent: "border-l-accent",
};

// ============================================================
// STAT CARD
// ============================================================
interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: { value: number; label?: string; isPositive?: boolean };
  description?: string;
  variant?: "default" | "gradient";
  valueClassName?: string;
  isLoading?: boolean;
  accentColor?: AccentColor;
  pulse?: boolean;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-muted-foreground",
  trend,
  description,
  valueClassName,
  isLoading = false,
  accentColor,
  pulse = false,
}: StatCardProps) {
  // Parse numeric value for count-up
  const numericValue =
    typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.]/g, ""));
  const suffix = typeof value === "string" ? String(value).replace(/[0-9.,]/g, "") : "";
  const isNumeric = !isNaN(numericValue) && isFinite(numericValue);
  const animatedValue = useCountUp(isNumeric ? numericValue : 0);
  const displayValue = isNumeric ? `${animatedValue}${suffix}` : value;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="mb-1 h-8 w-20" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  const isPositive =
    trend?.isPositive ?? (trend?.value !== undefined ? trend.value >= 0 : undefined);

  return (
    <Card
      variant="interactive"
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg",
        accentColor && `border-l-4 ${accentBorderMap[accentColor]}`
      )}
      aria-label={`${title}: ${value}`}
    >
      {/* Hover gradient accent */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      {/* Subtle shimmer on hover */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-foreground/[0.03] to-transparent transition-transform duration-700 group-hover:translate-x-full" />

      <CardContent className="relative p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {pulse && (
              <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
              </span>
            )}
            <p className="text-sm font-medium text-muted-foreground transition-colors duration-200 group-hover:text-foreground/80">
              {title}
            </p>
          </div>
          {Icon && (
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-md",
                iconColor.includes("bg-") ? iconColor : `bg-muted ${iconColor}`
              )}
              aria-hidden="true"
            >
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
        <div
          className={cn("text-2xl font-bold tracking-tight text-card-foreground", valueClassName)}
          aria-live="polite"
        >
          {displayValue}
        </div>
        {trend && (
          <div
            className={cn(
              "mt-2 flex items-center text-xs font-medium",
              isPositive ? "text-success" : "text-destructive"
            )}
          >
            {isPositive ? (
              <TrendingUp className="mr-1 h-3 w-3" aria-hidden="true" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3" aria-hidden="true" />
            )}
            <span className="sr-only">{isPositive ? "Aumento de" : "Redução de"}</span>
            <span>{Math.abs(trend.value)}%</span>
            <span className="ml-1 font-normal text-muted-foreground">
              {trend.label || "desde o último período"}
            </span>
          </div>
        )}
        {description && <p className="mt-2 text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}

interface StatCardsGridProps {
  columns?: 2 | 3 | 4;
  children: ReactNode;
}

export function StatCardsGrid({ columns = 4, children }: StatCardsGridProps) {
  const gridClass = {
    2: "grid gap-4 md:grid-cols-2",
    3: "grid gap-4 md:grid-cols-2 lg:grid-cols-3",
    4: "grid gap-4 md:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return <div className={gridClass}>{children}</div>;
}
