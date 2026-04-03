import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/helpers";

interface Props {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: { value: number; label?: string };
  description?: string;
  iconColor?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, description, iconColor }: Props) {
  const isPositive = trend && trend.value >= 0;

  return (
    <Card variant="interactive" className="group relative overflow-hidden">
      {/* Subtle gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardContent className="p-5 relative">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {Icon && (
            <div className={cn(
              "flex items-center justify-center w-9 h-9 rounded-lg transition-colors",
              iconColor || "bg-primary/10 text-primary"
            )}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="text-2xl font-bold text-card-foreground tracking-tight">{value}</div>

        {trend && (
          <div className={cn(
            "flex items-center text-xs mt-2 font-medium",
            isPositive ? "text-success" : "text-destructive"
          )}>
            {isPositive
              ? <TrendingUp className="w-3 h-3 mr-1" />
              : <TrendingDown className="w-3 h-3 mr-1" />
            }
            <span>{Math.abs(trend.value)}%</span>
            {trend.label && (
              <span className="text-muted-foreground ml-1 font-normal">{trend.label}</span>
            )}
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
