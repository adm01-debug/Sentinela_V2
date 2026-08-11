import React from 'react';
import { cn } from '@/lib/utils';
import { Key } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TwoFactorStatusProps {
  enabled: boolean;
  methods?: string[];
  className?: string;
}

export const TwoFactorStatus: React.FC<TwoFactorStatusProps> = ({
  enabled,
  methods = [],
  className,
}) => {
  const description = enabled
    ? methods.length > 0
      ? `Habilitado com ${methods.join(', ')}`
      : 'Habilitado'
    : 'Não habilitado — sua conta está menos segura';

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-lg border',
        enabled ? 'bg-success/5 border-success/20' : 'bg-muted border-border',
        className,
      )}
      role="status"
      aria-label={`Autenticação de dois fatores: ${enabled ? 'ativa' : 'inativa'}`}
    >
      <div
        className={cn(
          'p-2 rounded-full shrink-0',
          enabled ? 'bg-success/15' : 'bg-background',
        )}
      >
        <Key
          className={cn('h-5 w-5', enabled ? 'text-success' : 'text-muted-foreground')}
          aria-hidden="true"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium">Autenticação de Dois Fatores</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Badge variant={enabled ? 'default' : 'secondary'} className="shrink-0">
        {enabled ? 'Ativo' : 'Inativo'}
      </Badge>
    </div>
  );
};
