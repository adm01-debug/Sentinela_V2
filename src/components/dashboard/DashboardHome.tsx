import { StatsCard } from '@/components/Cards/StatsCard';
import { Users, Activity, Shield, Clock } from 'lucide-react';

export function DashboardHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do monitoramento de funcionários
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Funcionários"
          value="128"
          icon={Users}
          trend={{ value: 5.2, label: 'desde o mês passado' }}
        />
        <StatsCard
          title="Ativos Agora"
          value="45"
          icon={Activity}
          trend={{ value: 12, label: 'desde ontem' }}
        />
        <StatsCard
          title="Alertas de Segurança"
          value="3"
          icon={Shield}
          trend={{ value: -25, label: 'desde a semana passada' }}
        />
        <StatsCard
          title="Horas Trabalhadas"
          value="1,234"
          icon={Clock}
          description="Esta semana"
        />
      </div>
    </div>
  );
}
