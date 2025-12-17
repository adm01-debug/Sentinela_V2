import { Monitor, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { Employee } from '@/data/mockData';

const statusStyles = {
  online: 'bg-success',
  offline: 'bg-muted-foreground',
  idle: 'bg-warning',
};

interface EmployeeRowProps {
  employee: Employee;
}

export function EmployeeRow({ employee }: EmployeeRowProps) {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/employee/${employee.id}`)}
      className="flex items-center gap-4 rounded-lg border border-border/50 bg-card p-4 transition-all duration-200 hover:bg-accent/50 hover:border-primary/30 cursor-pointer"
    >
      <div className="relative">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
          {employee.avatar}
        </div>
        <div className={cn('absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card', statusStyles[employee.status])} />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{employee.name}</p>
        <p className="text-sm text-muted-foreground truncate">{employee.department}</p>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm text-muted-foreground">{employee.lastActivity}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {employee.device === 'desktop' ? (
            <Monitor className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        
        <div className={cn(
          'rounded-full px-2 py-1 text-xs font-medium',
          employee.productivityScore >= 85 ? 'bg-success/20 text-success' :
          employee.productivityScore >= 70 ? 'bg-warning/20 text-warning' :
          'bg-destructive/20 text-destructive'
        )}>
          {employee.productivityScore}%
        </div>
      </div>
    </div>
  );
}
