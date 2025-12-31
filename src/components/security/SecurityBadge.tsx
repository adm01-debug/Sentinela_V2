import { Shield, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSecurity, isSecureContext } from '@/hooks/useSecurity';
import { useAuth } from '@/hooks/useAuth';

type SecurityLevel = 'high' | 'medium' | 'low' | 'critical';

interface SecurityBadgeProps {
  showDetails?: boolean;
}

export function SecurityBadge({ showDetails = false }: SecurityBadgeProps) {
  const { isSecure, securityState } = useSecurity();
  const { isAuthenticated, session } = useAuth();

  const getSecurityLevel = (): SecurityLevel => {
    if (!isAuthenticated) return 'critical';
    if (!isSecureContext()) return 'low';
    if (securityState.isIdle) return 'medium';
    if (!isSecure) return 'medium';
    return 'high';
  };

  const level = getSecurityLevel();

  const config = {
    high: {
      icon: ShieldCheck,
      label: 'Seguro',
      color: 'bg-green-500/10 text-green-600 border-green-500/20',
      description: 'Conexão segura e autenticada',
    },
    medium: {
      icon: Shield,
      label: 'Atenção',
      color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      description: 'Verifique sua sessão',
    },
    low: {
      icon: ShieldAlert,
      label: 'Inseguro',
      color: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      description: 'Conexão não segura (HTTP)',
    },
    critical: {
      icon: ShieldX,
      label: 'Desconectado',
      color: 'bg-destructive/10 text-destructive border-destructive/20',
      description: 'Faça login para continuar',
    },
  };

  const { icon: Icon, label, color, description } = config[level];

  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`p-1.5 rounded-full ${color}`}>
              <Icon className="h-4 w-4" />
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
    <Badge variant="outline" className={`${color} gap-1.5`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  );
}
