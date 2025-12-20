import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonitoringEmployee {
  id: string;
  name: string;
  email: string;
  department: string;
  status: 'online' | 'offline' | 'idle' | 'busy';
  last_activity: string;
  productivity_score: number;
}

interface EmployeeMonitoringCardProps {
  employee: MonitoringEmployee;
  isSelected?: boolean;
  onClick: () => void;
}

const statusColors = {
  online: 'bg-green-500',
  busy: 'bg-blue-500',
  idle: 'bg-yellow-500',
  offline: 'bg-gray-400',
};

const statusLabels = {
  online: 'Online',
  busy: 'Ocupado',
  idle: 'Ocioso',
  offline: 'Offline',
};

function EmployeeMonitoringCardComponent({ employee, isSelected, onClick }: EmployeeMonitoringCardProps) {
  const initials = employee.name.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${statusColors[employee.status]}`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="font-medium truncate">{employee.name}</p>
              <Badge variant="outline" className="text-xs">
                {statusLabels[employee.status]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">{employee.department}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(employee.last_activity), { addSuffix: true, locale: ptBR })}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Produtividade</span>
            <span className="font-medium">{employee.productivity_score}%</span>
          </div>
          <Progress value={employee.productivity_score} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

export const EmployeeMonitoringCard = memo(EmployeeMonitoringCardComponent);
