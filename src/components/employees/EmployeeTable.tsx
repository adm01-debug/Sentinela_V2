import { memo, useCallback } from 'react';
import { Edit, Trash2, Monitor, Smartphone, Link2, Unlink, Mail, Phone, Building2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { cn } from '@/lib/utils';
import type { EmployeeWithDetails } from '@/hooks/useEmployees';
import { statusConfig, getInitials } from '@/hooks/useEmployeesPage';

interface Team {
  id: string;
  name: string;
}

interface EmployeeTableProps {
  employees: EmployeeWithDetails[];
  teams: Team[];
  onEdit: (employee: EmployeeWithDetails) => void;
  onDelete: (employee: EmployeeWithDetails) => void;
  onAssignDevice: (employee: EmployeeWithDetails) => void;
  onUnassignDevice: (employeeId: string, deviceId: string) => void;
}

const deviceTypeIcons = {
  desktop: Monitor,
  laptop: Monitor,
  mobile: Smartphone
};

function EmployeeTableComponent({
  employees,
  teams,
  onEdit,
  onDelete,
  onAssignDevice,
  onUnassignDevice,
}: EmployeeTableProps) {
  const getTeamName = useCallback((teamId: string | null) => {
    if (!teamId) return null;
    const team = teams.find(t => t.id === teamId);
    return team?.name || null;
  }, [teams]);

  if (employees.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nenhum funcionário encontrado</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Funcionário</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Departamento</TableHead>
            <TableHead>Equipe</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Dispositivos</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => {
            const status = statusConfig[employee.status as keyof typeof statusConfig];
            const teamName = getTeamName(employee.team_id);

            return (
              <TableRow key={employee.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={employee.avatar_url || undefined} />
                      <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      {employee.position && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {employee.position}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    {employee.email && (
                      <p className="text-sm flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {employee.email}
                      </p>
                    )}
                    {employee.phone && (
                      <p className="text-sm flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {employee.phone}
                      </p>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  {employee.department && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      {employee.department}
                    </span>
                  )}
                </TableCell>

                <TableCell>
                  {teamName ? (
                    <Badge variant="outline">{teamName}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>

                <TableCell>
                  <Badge className={cn('font-normal', status?.color)}>
                    {status?.label || employee.status}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {employee.devices && employee.devices.length > 0 ? (
                      employee.devices.map((device) => {
                        const DeviceIcon = deviceTypeIcons[device.device_type as keyof typeof deviceTypeIcons] || Monitor;
                        return (
                          <TooltipProvider key={device.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge 
                                  variant="secondary" 
                                  className="cursor-pointer flex items-center gap-1"
                                  onClick={() => onUnassignDevice(employee.id, device.id)}
                                >
                                  <DeviceIcon className="h-3 w-3" />
                                  {device.device_name}
                                  {device.is_primary && <span className="text-xs">★</span>}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Clique para desvincular</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })
                    ) : (
                      <span className="text-muted-foreground text-sm">Nenhum</span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onAssignDevice(employee)}
                          >
                            <Link2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Vincular dispositivo</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(employee)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(employee)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Excluir</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export const EmployeeTable = memo(EmployeeTableComponent);
