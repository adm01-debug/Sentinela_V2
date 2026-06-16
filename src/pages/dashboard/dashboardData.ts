import { Monitor, Eye, CheckCircle, Users, Globe } from "lucide-react";

export type Period = "day" | "week" | "month";

export const fallbackActivityData = [
  { time: "06:00", ativos: 5, inativos: 123 },
  { time: "08:00", ativos: 42, inativos: 86 },
  { time: "09:00", ativos: 98, inativos: 30 },
  { time: "10:00", ativos: 112, inativos: 16 },
  { time: "11:00", ativos: 105, inativos: 23 },
  { time: "12:00", ativos: 65, inativos: 63 },
  { time: "13:00", ativos: 88, inativos: 40 },
  { time: "14:00", ativos: 110, inativos: 18 },
  { time: "15:00", ativos: 115, inativos: 13 },
  { time: "16:00", ativos: 95, inativos: 33 },
  { time: "17:00", ativos: 55, inativos: 73 },
  { time: "18:00", ativos: 12, inativos: 116 },
];

export const fallbackProductivityData = [
  { day: "Seg", horas: 7.5 },
  { day: "Ter", horas: 8.2 },
  { day: "Qua", horas: 7.8 },
  { day: "Qui", horas: 8.5 },
  { day: "Sex", horas: 7.1 },
];

export const fallbackAlerts = [
  {
    id: "1",
    message: "Acesso não autorizado detectado",
    severity: "critical" as const,
    time: "2 min atrás",
    employee: "Carlos Silva",
  },
  {
    id: "2",
    message: "Tentativa de exportação em massa",
    severity: "high" as const,
    time: "15 min atrás",
    employee: "Ana Costa",
  },
  {
    id: "3",
    message: "Login fora do horário padrão",
    severity: "medium" as const,
    time: "1h atrás",
    employee: "Pedro Santos",
  },
  {
    id: "4",
    message: "Novo dispositivo conectado",
    severity: "low" as const,
    time: "2h atrás",
    employee: "Maria Oliveira",
  },
];

export const fallbackActivities = [
  { id: "1", user: "Ana Costa", action: "iniciou sessão", time: "2 min atrás", icon: Monitor },
  { id: "2", user: "Carlos Silva", action: "acessou relatórios", time: "5 min atrás", icon: Eye },
  {
    id: "3",
    user: "Pedro Santos",
    action: "finalizou tarefa",
    time: "12 min atrás",
    icon: CheckCircle,
  },
  {
    id: "4",
    user: "Maria Oliveira",
    action: "atualizou perfil",
    time: "20 min atrás",
    icon: Users,
  },
  { id: "5", user: "João Lima", action: "navegou site externo", time: "25 min atrás", icon: Globe },
];

export const severityStyles: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  high: "bg-warning/10 text-warning border-warning/20",
  medium: "bg-info/10 text-info border-info/20",
  low: "bg-muted text-muted-foreground border-border",
};

export const severityLabels: Record<string, string> = {
  critical: "Crítica",
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};
