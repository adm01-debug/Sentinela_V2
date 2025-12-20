import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Trash2, Monitor, Smartphone, Link2, Mail, Phone, Building2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VirtualizedTable, type Column } from '@/components/VirtualizedTable';
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

// Use VirtualizedTable for large lists (>50 items), regular table for small lists
const VIRTUALIZATION_THRESHOLD = 50;

function EmployeeTableComponent({
  employees,
  teams,
  onEdit,
  onDelete,
  onAssignDevice,
  onUnassignDevice,
}: EmployeeTableProps) {
  const { t } = useTranslation();

  const getTeamName = useCallback((teamId: string | null) => {
    if (!teamId) return null;
    const team = teams.find(t => t.id === teamId);
    return team?.name || null;
  }, [teams]);

  const columns: Column<EmployeeWithDetails>[] = [
    {
      key: 'employee',
      header: t('employees.name'),
      width: '250px',
      render: (employee) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={employee.avatar_url || undefined} />
            <AvatarFallback className="text-xs">{getInitials(employee.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium truncate">{employee.name}</p>
            {employee.position && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                <Briefcase className="h-3 w-3 flex-shrink-0" />
                {employee.position}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: t('employees.email'),
      width: '200px',
      render: (employee) => (
        <div className="space-y-0.5 min-w-0">
          {employee.email && (
            <p className="text-sm flex items-center gap-1 truncate">
              <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{employee.email}</span>
            </p>
          )}
          {employee.phone && (
            <p className="text-sm flex items-center gap-1">
              <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              {employee.phone}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'department',
      header: t('employees.department'),
      width: '150px',
      render: (employee) => (
        employee.department ? (
          <span className="flex items-center gap-1 text-sm">
            <Building2 className="h-3 w-3 text-muted-foreground" />
            {employee.department}
          </span>
        ) : <span className="text-muted-foreground">-</span>
      ),
    },
    {
      key: 'team',
      header: t('employees.team'),
      width: '120px',
      render: (employee) => {
        const teamName = getTeamName(employee.team_id);
        return teamName ? (
          <Badge variant="outline" className="text-xs">{teamName}</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        );
      },
    },
    {
      key: 'status',
      header: t('employees.status'),
      width: '100px',
      render: (employee) => {
        const status = statusConfig[employee.status as keyof typeof statusConfig];
        return (
          <Badge className={cn('font-normal text-xs', status?.color)}>
            {status?.label || employee.status}
          </Badge>
        );
      },
    },
    {
      key: 'devices',
      header: t('employees.devices'),
      width: '200px',
      render: (employee) => (
        <div className="flex flex-wrap gap-1">
          {employee.devices && employee.devices.length > 0 ? (
            employee.devices.slice(0, 2).map((device) => {
              const DeviceIcon = deviceTypeIcons[device.device_type as keyof typeof deviceTypeIcons] || Monitor;
              return (
                <TooltipProvider key={device.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant="secondary" 
                        className="cursor-pointer flex items-center gap-1 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnassignDevice(employee.id, device.id);
                        }}
                      >
                        <DeviceIcon className="h-3 w-3" />
                        {device.device_name.slice(0, 10)}
                        {device.is_primary && <span>★</span>}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('common.delete')}: {device.device_name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })
          ) : (
            <span className="text-muted-foreground text-xs">{t('common.none')}</span>
          )}
          {employee.devices && employee.devices.length > 2 && (
            <Badge variant="outline" className="text-xs">+{employee.devices.length - 2}</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      width: '120px',
      className: 'justify-end',
      render: (employee) => (
        <div className="flex justify-end gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssignDevice(employee);
                  }}
                >
                  <Link2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('employees.assignDevice')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(employee);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('common.edit')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(employee);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('common.delete')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];

  if (employees.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{t('employees.noEmployees')}</p>
      </div>
    );
  }

  // Use virtualization for large lists
  if (employees.length > VIRTUALIZATION_THRESHOLD) {
    return (
      <VirtualizedTable
        data={employees}
        columns={columns}
        rowHeight={64}
        containerHeight={500}
        keyExtractor={(employee) => employee.id}
        emptyMessage={t('employees.noEmployees')}
      />
    );
  }

  // Regular table for small lists (better for accessibility)
  return (
    <div className="rounded-md border">
      <div className="flex items-center bg-muted/50 border-b border-border font-medium text-sm h-14">
        {columns.map((column) => (
          <div
            key={column.key}
            className={cn('px-4 py-2', column.className)}
            style={{ width: column.width || 'auto', flex: column.width ? 'none' : 1 }}
          >
            {column.header}
          </div>
        ))}
      </div>
      <div>
        {employees.map((employee, index) => (
          <div
            key={employee.id}
            className="flex items-center border-b border-border hover:bg-muted/50 transition-colors h-16"
          >
            {columns.map((column) => (
              <div
                key={column.key}
                className={cn('px-4 py-2 flex items-center', column.className)}
                style={{ width: column.width || 'auto', flex: column.width ? 'none' : 1 }}
              >
                {column.render(employee, index)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export const EmployeeTable = memo(EmployeeTableComponent);
