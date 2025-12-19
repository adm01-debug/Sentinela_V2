import { memo } from 'react';
import { Trash2, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EmployeeSchedule {
  id: string;
  employee_id: string;
  schedule_id: string;
  effective_date: string;
}

interface Employee {
  id: string;
  name: string;
}

interface Schedule {
  id: string;
  name: string;
}

interface EmployeeSchedulesTableProps {
  employeeSchedules: EmployeeSchedule[];
  employees: Employee[];
  schedules: Schedule[];
  onRemove: (assignmentId: string) => void;
}

function EmployeeSchedulesTableComponent({
  employeeSchedules,
  employees,
  schedules,
  onRemove,
}: EmployeeSchedulesTableProps) {
  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || 'Não encontrado';
  };

  const getScheduleName = (scheduleId: string) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    return schedule?.name || 'Não encontrado';
  };

  if (employeeSchedules.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum funcionário com horário atribuído</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Funcionário</TableHead>
            <TableHead>Horário</TableHead>
            <TableHead>Vigência</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employeeSchedules.map((assignment) => (
            <TableRow key={assignment.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="font-medium">
                    {getEmployeeName(assignment.employee_id)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {getScheduleName(assignment.schedule_id)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(assignment.effective_date), "dd/MM/yyyy", { locale: ptBR })}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemove(assignment.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Remover atribuição</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export const EmployeeSchedulesTable = memo(EmployeeSchedulesTableComponent);
