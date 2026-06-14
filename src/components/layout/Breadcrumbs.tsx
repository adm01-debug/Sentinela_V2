import { memo, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Human-readable labels for each known path segment.
const segmentLabels: Record<string, string> = {
  dashboard: "Dashboard",
  employees: "Colaboradores",
  activities: "Atividades",
  timeline: "Linha do tempo",
  analytics: "Analytics",
  productivity: "Produtividade",
  applications: "Aplicações",
  trends: "Tendências",
  reports: "Relatórios",
  custom: "Personalizados",
  scheduled: "Agendados",
  alerts: "Alertas",
  rules: "Regras",
  monitoring: "Monitoramento",
  violations: "Violações",
  settings: "Configurações",
  profile: "Perfil",
  security: "Segurança",
  notifications: "Notificações",
  integrations: "Integrações",
  webhooks: "Webhooks",
  whatsapp: "WhatsApp",
  billing: "Faturamento",
  api: "API",
  admin: "Admin",
  users: "Usuários",
  roles: "Funções",
  teams: "Equipes",
  departments: "Departamentos",
  audit: "Auditoria",
  telemetria: "Telemetria",
  ueba: "UEBA",
  dlp: "DLP",
  policies: "Políticas",
  incidents: "Incidentes",
  "edge-functions": "Edge Functions",
  devices: "Dispositivos",
  screenshots: "Capturas",
  calendar: "Calendário",
  geofencing: "Geofencing",
  "work-schedules": "Jornadas",
  export: "Exportar",
  compliance: "Compliance",
  "ai-analysis": "Análise IA",
  gamification: "Gamificação",
  "internet-access": "Acesso à Internet",
  "time-clock": "Ponto",
  projects: "Projetos",
  timesheets: "Folhas de Ponto",
  attendance: "Presença",
  "hours-tracking": "Horas",
  new: "Novo",
  edit: "Editar",
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function labelForSegment(segment: string): string {
  if (segmentLabels[segment]) return segmentLabels[segment];
  if (UUID_REGEX.test(segment) || /^\d+$/.test(segment)) return "Detalhes";
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
}

interface BreadcrumbsProps {
  className?: string;
  showHome?: boolean;
}

function BreadcrumbsBase({ className, showHome = true }: BreadcrumbsProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const trail = useMemo(() => {
    const segments = currentPath.split("/").filter(Boolean);
    return segments.map((segment, index) => {
      const path = "/" + segments.slice(0, index + 1).join("/");
      return {
        path,
        label: labelForSegment(segment),
        isCurrent: index === segments.length - 1,
      };
    });
  }, [currentPath]);

  // Breadcrumbs only add value for nested routes (2+ segments). Single-segment
  // routes (e.g. /employees, /alerts) and the dashboard/root are hidden.
  if (trail.length < 2) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Breadcrumb aria-label="Breadcrumb">
        <BreadcrumbList>
          {showHome && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-1 transition-colors hover:text-primary"
                  >
                    <Home className="h-4 w-4" />
                    <span className="sr-only">Dashboard</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
              </BreadcrumbSeparator>
            </>
          )}
          {trail.map((item, index) => (
            <BreadcrumbItem key={item.path}>
              {item.isCurrent ? (
                <BreadcrumbPage className="font-medium">{item.label}</BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink asChild>
                    <Link to={item.path} className="transition-colors hover:text-primary">
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                  {index < trail.length - 1 && (
                    <BreadcrumbSeparator>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                    </BreadcrumbSeparator>
                  )}
                </>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </motion.div>
  );
}

export const Breadcrumbs = memo(BreadcrumbsBase);
