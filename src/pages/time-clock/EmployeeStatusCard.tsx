import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Square } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type StatusKey = 'online' | 'idle' | 'break' | 'offline';

const statusConfig: Record<StatusKey, { label: string; colorClass: string; dotClass: string }> = {
  online: { label: 'Online', colorClass: 'text-success', dotClass: 'bg-success' },
  idle: { label: 'Ocioso', colorClass: 'text-warning', dotClass: 'bg-warning' },
  break: { label: 'Em Pausa', colorClass: 'text-info', dotClass: 'bg-info' },
  offline: { label: 'Offline', colorClass: 'text-muted-foreground', dotClass: 'bg-muted-foreground/50' },
};

interface EmployeeWithStatus {
  id: string;
  name: string;
  department: string | null;
  position: string | null;
  avatar_url: string | null;
  currentStatus: StatusKey;
  clockInAt: string | null | undefined;
  isClockedIn: boolean;
}

interface EmployeeStatusCardProps {
  employee: EmployeeWithStatus;
  onClockIn: (id: string) => void;
  onClockOut: (id: string) => void;
}

export function EmployeeStatusCard({ employee, onClockIn, onClockOut }: EmployeeStatusCardProps) {
  const cfg = statusConfig[employee.currentStatus] || statusConfig.offline;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
          {employee.avatar_url ? (
            <img src={employee.avatar_url} alt={`Foto de ${employee.name}`} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            employee.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
          )}
        </div>
        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background ${cfg.dotClass}`} aria-label={cfg.label} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{employee.name}</p>
        <p className="text-xs text-muted-foreground truncate">{employee.department || employee.position || '—'}</p>
        {employee.isClockedIn && employee.clockInAt && (
          <p className="text-xs text-success mt-0.5">
            <Clock className="inline h-3 w-3 mr-1" aria-hidden="true" />
            Desde {format(new Date(employee.clockInAt), 'HH:mm', { locale: ptBR })}
          </p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1">
        <Badge variant="outline" className={`text-[10px] ${cfg.colorClass}`}>{cfg.label}</Badge>
        {employee.isClockedIn ? (
          <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => onClockOut(employee.id)} aria-label={`Registrar saída de ${employee.name}`}>
            <Square className="h-3 w-3 mr-1" aria-hidden="true" /> Saída
          </Button>
        ) : (
          <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => onClockIn(employee.id)} aria-label={`Registrar entrada de ${employee.name}`}>
            <Play className="h-3 w-3 mr-1" aria-hidden="true" /> Entrada
          </Button>
        )}
      </div>
    </div>
  );
}

export { statusConfig, type StatusKey, type EmployeeWithStatus };
