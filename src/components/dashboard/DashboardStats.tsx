import React from "react";
import { Users, AlertTriangle, Monitor, TrendingUp } from "lucide-react";
import { StatCard, StatCardsGrid } from "@/components/StatCard";

interface DashboardStatsProps {
  employees: number;
  violations: number;
  activeDevices: number;
  productivity: number;
  previousEmployees?: number;
  previousViolations?: number;
  previousDevices?: number;
  previousProductivity?: number;
  isLoading?: boolean;
}

export const DashboardStats = React.memo(function DashboardStats({
  employees,
  violations,
  activeDevices,
  productivity,
  previousEmployees,
  previousViolations,
  previousDevices,
  previousProductivity,
  isLoading = false,
}: DashboardStatsProps) {
  // Calculate trends
  const employeeTrend = previousEmployees
    ? {
        value: Math.round(((employees - previousEmployees) / previousEmployees) * 100),
        label: "vs semana anterior",
      }
    : undefined;

  const violationTrend = previousViolations
    ? {
        value: Math.round(((violations - previousViolations) / previousViolations) * 100),
        label: "vs semana anterior",
        isPositive: violations < previousViolations,
      }
    : undefined;

  const deviceTrend = previousDevices
    ? {
        value: Math.round(((activeDevices - previousDevices) / previousDevices) * 100),
        label: "vs semana anterior",
      }
    : undefined;

  const productivityTrend = previousProductivity
    ? { value: Math.round(productivity - previousProductivity), label: "pontos vs semana anterior" }
    : undefined;

  return (
    <StatCardsGrid columns={4}>
      <StatCard
        title="Funcionários Ativos"
        value={employees.toLocaleString("pt-BR")}
        icon={Users}
        iconColor="text-primary"
        trend={employeeTrend}
        variant="default"
        isLoading={isLoading}
      />
      <StatCard
        title="Violações (7 dias)"
        value={violations.toLocaleString("pt-BR")}
        icon={AlertTriangle}
        iconColor="text-destructive"
        trend={violationTrend}
        variant="default"
        valueClassName={violations > 0 ? "text-destructive" : undefined}
        isLoading={isLoading}
      />
      <StatCard
        title="Dispositivos Ativos"
        value={activeDevices.toLocaleString("pt-BR")}
        icon={Monitor}
        iconColor="text-success"
        trend={deviceTrend}
        variant="default"
        valueClassName="text-success"
        isLoading={isLoading}
      />
      <StatCard
        title="Produtividade"
        value={`${productivity}%`}
        icon={TrendingUp}
        iconColor="text-info"
        trend={productivityTrend}
        variant="gradient"
        valueClassName="text-info"
        isLoading={isLoading}
      />
    </StatCardsGrid>
  );
});
