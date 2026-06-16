import React from "react";
import { motion } from "framer-motion";
import { Users, Activity, Shield, ArrowUpRight, ArrowDownRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  color: "primary" | "success" | "warning" | "destructive" | "info";
  sparklineData?: number[];
  delay?: number;
}

const colorVariants = {
  primary: {
    bg: "bg-primary/10",
    icon: "text-primary",
    glow: "shadow-primary/20",
    trend: "text-primary",
  },
  success: {
    bg: "bg-success/10",
    icon: "text-success",
    glow: "shadow-success/20",
    trend: "text-success",
  },
  warning: {
    bg: "bg-warning/10",
    icon: "text-warning",
    glow: "shadow-warning/20",
    trend: "text-warning",
  },
  destructive: {
    bg: "bg-destructive/10",
    icon: "text-destructive",
    glow: "shadow-destructive/20",
    trend: "text-destructive",
  },
  info: {
    bg: "bg-info/10",
    icon: "text-info",
    glow: "shadow-info/20",
    trend: "text-info",
  },
};

// Mini sparkline component
const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 30;
  const width = 80;
  const points = data.map((val, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((val - min) / range) * height,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={`hsl(var(--${color}))`} stopOpacity="0.3" />
          <stop offset="100%" stopColor={`hsl(var(--${color}))`} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <path d={`${pathD} L ${width} ${height} L 0 ${height} Z`} fill={`url(#gradient-${color})`} />
      {/* Line */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={`hsl(var(--${color}))`}
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
      {/* End dot */}
      <motion.circle
        cx={points[points.length - 1]?.x}
        cy={points[points.length - 1]?.y}
        r="3"
        fill={`hsl(var(--${color}))`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5 }}
      />
    </svg>
  );
};

const HeroMetricCard = ({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  color,
  sparklineData,
  delay = 0,
}: MetricCardProps) => {
  const colors = colorVariants[color];
  const isPositive = change !== undefined && change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card
        className={cn(
          "relative overflow-hidden p-6 transition-all duration-300 hover:shadow-lg",
          "border-0 bg-card/80 backdrop-blur-sm"
        )}
      >
        {/* Glow effect */}
        <div
          className={cn(
            "absolute -right-20 -top-20 h-40 w-40 rounded-full opacity-20 blur-3xl",
            colors.bg
          )}
        />

        <div className="relative z-10">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <div className={cn("rounded-xl p-3", colors.bg)}>
              <Icon className={cn("h-5 w-5", colors.icon)} />
            </div>

            {sparklineData && <Sparkline data={sparklineData} color={color} />}
          </div>

          {/* Value */}
          <div className="space-y-1">
            <motion.p
              className="text-3xl font-bold tracking-tight"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: delay + 0.2, duration: 0.3 }}
            >
              {value}
            </motion.p>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
          </div>

          {/* Change indicator */}
          {change !== undefined && (
            <motion.div
              className="mt-3 flex items-center gap-1.5"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.4 }}
            >
              <div
                className={cn(
                  "flex items-center gap-0.5 rounded-full px-2 py-1 text-xs font-medium",
                  isPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                )}
              >
                {isPositive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(change)}%
              </div>
              {changeLabel && <span className="text-xs text-muted-foreground">{changeLabel}</span>}
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

interface HeroMetricsProps {
  totalEmployees?: number;
  activeNow?: number;
  violationsToday?: number;
  productivity?: number;
  employeeChange?: number;
  activeChange?: number;
  violationsChange?: number;
  productivityChange?: number;
}

export const HeroMetrics = ({
  totalEmployees = 0,
  activeNow = 0,
  violationsToday = 0,
  productivity = 0,
  employeeChange,
  activeChange,
  violationsChange,
  productivityChange,
}: HeroMetricsProps) => {
  // Generate sample sparkline data
  const generateSparkline = (trend: "up" | "down" | "stable") => {
    const base = Array.from({ length: 7 }, () => Math.random() * 20 + 40);
    if (trend === "up") {
      return base.map((v, i) => v + i * 5);
    } else if (trend === "down") {
      return base.map((v, i) => v - i * 3);
    }
    return base;
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <HeroMetricCard
        title="Total de Funcionários"
        value={totalEmployees.toLocaleString("pt-BR")}
        change={employeeChange}
        changeLabel="vs. mês anterior"
        icon={Users}
        color="primary"
        sparklineData={generateSparkline("up")}
        delay={0}
      />

      <HeroMetricCard
        title="Ativos Agora"
        value={activeNow.toLocaleString("pt-BR")}
        change={activeChange}
        changeLabel="última hora"
        icon={Activity}
        color="success"
        sparklineData={generateSparkline("stable")}
        delay={0.1}
      />

      <HeroMetricCard
        title="Violações Hoje"
        value={violationsToday.toString()}
        change={violationsChange}
        changeLabel="vs. ontem"
        icon={Shield}
        color={violationsToday > 10 ? "destructive" : "warning"}
        sparklineData={generateSparkline("down")}
        delay={0.2}
      />

      <HeroMetricCard
        title="Produtividade"
        value={`${productivity}%`}
        change={productivityChange}
        changeLabel="média semanal"
        icon={Zap}
        color="info"
        sparklineData={generateSparkline("up")}
        delay={0.3}
      />
    </div>
  );
};

export default HeroMetrics;
