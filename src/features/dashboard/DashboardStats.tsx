"use client";
import { StatsCard } from "@/components/Cards";
import { Users, Activity, AlertTriangle, TrendingUp } from "lucide-react";

interface Props {
  stats?: {
    totalEmployees: number;
    activeNow: number;
    violations: number;
    productivity: number;
  };
}

export function DashboardStats({ stats }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Employees"
        value={stats?.totalEmployees || 0}
        icon={Users}
        trend={{ value: 12 }}
      />
      <StatsCard
        title="Active Now"
        value={stats?.activeNow || 0}
        icon={Activity}
        description="Currently online"
      />
      <StatsCard
        title="Violations"
        value={stats?.violations || 0}
        icon={AlertTriangle}
        trend={{ value: -5, label: "this week" }}
      />
      <StatsCard
        title="Productivity"
        value={`${stats?.productivity || 0}%`}
        icon={TrendingUp}
        trend={{ value: 8 }}
      />
    </div>
  );
}
