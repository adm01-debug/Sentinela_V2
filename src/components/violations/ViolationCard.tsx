import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Violation {
  id: string;
  employee_name: string;
  violation_type: string;
  severity: string;
  status: string;
  description?: string;
  created_at: string;
}

interface ViolationCardProps {
  violation: Violation;
  typeLabel: string;
  onViewDetails: (v: Violation) => void;
  onResolve: (v: Violation) => void;
}

const severityColors: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  open: 'destructive',
  investigating: 'default',
  resolved: 'secondary',
  dismissed: 'outline',
};

function ViolationCardComponent({ violation, typeLabel, onViewDetails, onResolve }: ViolationCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`w-2 h-full min-h-[60px] rounded-full ${severityColors[violation.severity]}`} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium">{violation.employee_name}</p>
                <Badge variant={statusVariants[violation.status]}>{violation.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{typeLabel}</p>
              {violation.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{violation.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {formatDistanceToNow(new Date(violation.created_at), { addSuffix: true, locale: ptBR })}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => onViewDetails(violation)}>
              <Eye className="h-4 w-4" />
            </Button>
            {violation.status === 'open' && (
              <Button variant="ghost" size="icon" onClick={() => onResolve(violation)}>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const ViolationCard = memo(ViolationCardComponent);
