import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Fingerprint } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DeviceTrustProps {
  trusted: boolean;
  verified?: boolean;
  className?: string;
}

export const DeviceTrustIndicator: React.FC<DeviceTrustProps> = ({
  trusted,
  verified = false,
  className,
}) => {
  return (
    <div
      className={cn('flex items-center gap-2', className)}
      role="status"
      aria-label={trusted ? 'Dispositivo confiável' : 'Dispositivo não verificado'}
    >
      {trusted ? (
        <>
          <CheckCircle className="h-4 w-4 text-success shrink-0" aria-hidden="true" />
          <span className="text-sm text-success">Dispositivo Confiável</span>
          {verified && (
            <Badge variant="outline" className="text-xs">
              <Fingerprint className="h-3 w-3 mr-1" aria-hidden="true" />
              Verificado
            </Badge>
          )}
        </>
      ) : (
        <>
          <XCircle className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
          <span className="text-sm text-muted-foreground">Dispositivo Não Verificado</span>
        </>
      )}
    </div>
  );
};
