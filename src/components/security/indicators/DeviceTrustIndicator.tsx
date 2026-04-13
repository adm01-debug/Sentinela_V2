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
    <div className={cn('flex items-center gap-2', className)}>
      {trusted ? (
        <>
          <CheckCircle className="h-4 w-4 text-success" />
          <span className="text-sm text-success">Trusted Device</span>
          {verified && (
            <Badge variant="outline" className="text-xs">
              <Fingerprint className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </>
      ) : (
        <>
          <XCircle className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Unverified Device</span>
        </>
      )}
    </div>
  );
};
