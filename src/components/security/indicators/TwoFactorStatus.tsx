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
  return (
    <div className={cn(
      'flex items-center gap-4 p-4 rounded-lg border',
      enabled ? 'bg-success/5 border-success/20' : 'bg-muted',
      className
    )}>
      <div className={cn('p-2 rounded-full', enabled ? 'bg-success/10' : 'bg-muted')}>
        <Key className={cn('h-5 w-5', enabled ? 'text-success' : 'text-muted-foreground')} />
      </div>
      <div className="flex-1">
        <p className="font-medium">Two-Factor Authentication</p>
        <p className="text-sm text-muted-foreground">
          {enabled
            ? `Enabled with ${methods.join(', ')}`
            : 'Not enabled - your account is less secure'}
        </p>
      </div>
      <Badge variant={enabled ? 'default' : 'secondary'}>
        {enabled ? 'Active' : 'Inactive'}
      </Badge>
    </div>
  );
};
