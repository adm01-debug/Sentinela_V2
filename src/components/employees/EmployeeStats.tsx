import { memo } from 'react';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import { StatCard } from '@/components/StatCard';

// ============================================================
// TYPES
// ============================================================

export interface EmployeeStatsProps {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  onlineNow: number;
  isLoading?: boolean;
}

// ============================================================
// COMPONENT
// ============================================================

export const EmployeeStats = memo(function EmployeeStats({
  totalEmployees,
  activeEmployees,
  inactiveEmployees,
  onlineNow,
  isLoading = false,
}: EmployeeStatsProps) {
  const stats = [
    {
      title: 'Total de Funcionários',
      value: totalEmployees,
      icon: Users,
      description: 'Cadastrados no sistema',
      color: 'default' as const,
    },
    {
      title: 'Ativos',
      value: activeEmployees,
      icon: UserCheck,
      description: `${Math.round((activeEmployees / totalEmployees) * 100) || 0}% do total`,
      color: 'success' as const,
    },
    {
      title: 'Inativos',
      value: inactiveEmployees,
      icon: UserX,
      description: 'Contas desativadas',
      color: 'warning' as const,
    },
    {
      title: 'Online Agora',
      value: onlineNow,
      icon: Clock,
      description: 'Ativos nos últimos 5 min',
      color: 'default' as const,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          description={stat.description}
          color={stat.color}
          loading={isLoading}
        />
      ))}
    </div>
  );
});
