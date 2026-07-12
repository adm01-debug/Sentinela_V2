import { Shield, ShieldCheck, ShieldAlert, ShieldX, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSecurity, isSecureContext } from '@/hooks/useSecurity';
import { useAuth } from '@/hooks/useAuth';

type SecurityLevel = 'high' | 'medium' | 'low' | 'critical';

interface SecurityBadgeProps {
  showDetails?: boolean;
}

interface LevelConfig {
  icon: LucideIcon;
  label: string;
  color: string;
  description: string;
}

const CONFIG: Record<SecurityLevel, LevelConfig> = {
  high: {
    icon: ShieldCheck,
    label: 'Seguro',
    color: 'bg-success/15 text-success border-success/20',
    description: 'Conexão segura e autenticada',
  },
  medium: {
    icon: Shield,
    label: 'Atenção',
    color: 'bg-warning/15 text-warning border-warning/20',
    description: 'Verifique sua sessão',
  },
  low: {
    icon: ShieldAlert,
    label: 'Inseguro',
    color: 'bg-warning/15 text-warning border-warning/20',
    description: 'Conexão não segura (HTTP)',
  },
  critical: {
    icon: ShieldX,
    label: 'Desconectado',
    color: 'bg-destructive/15 text-destructive border-destructive/20',
    description: 'Faça login para continuar',
  },
};

export function SecurityBadge({ showDetails = false }: SecurityBadgeProps) {
  const { isSecure, securityState } = useSecurity();
  const { isAuthenticated } = useAuth();

  const level: SecurityLevel = !isAuthenticated
    ? 'critical'
    : !isSecureContext()
      ? 'low'
      : securityState.isIdle || !isSecure
        ? 'medium'
        : 'high';

  const { icon: Icon, label, color, description } = CONFIG[level];

  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`p-1.5 rounded-full ${color}`}
              role="status"
              aria-label={`Status de segurança: ${label}. ${description}`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Badge variant="outline" className={`${color} gap-1.5`} aria-label={`Status: ${label}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </Badge>
  );
}
