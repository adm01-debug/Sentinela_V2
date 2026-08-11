import { useState, useMemo } from 'react';
import { Filter, X, Calendar, User, AppWindow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export interface RealtimeFilters {
  employeeName: string;
  appName: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
}

interface RealtimeActivityFiltersProps {
  filters: RealtimeFilters;
  onFiltersChange: (filters: RealtimeFilters) => void;
  employees: string[];
  apps: string[];
}

export const RealtimeActivityFilters = ({
  filters,
  onFiltersChange,
  employees,
  apps,
}: RealtimeActivityFiltersProps) => {
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.employeeName) count++;
    if (filters.appName) count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    return count;
  }, [filters]);

  const clearFilters = () => {
    onFiltersChange({
      employeeName: '',
      appName: '',
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg border">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Filtros</span>
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {activeFiltersCount}
          </Badge>
        )}
      </div>

      {/* Employee Filter */}
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <Select
          value={filters.employeeName || 'all'}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, employeeName: value === 'all' ? '' : value })
          }
        >
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Funcionário" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos funcionários</SelectItem>
            {employees.map((employee) => (
              <SelectItem key={employee} value={employee}>
                {employee}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* App Filter */}
      <div className="flex items-center gap-2">
        <AppWindow className="h-4 w-4 text-muted-foreground" />
        <Select
          value={filters.appName || 'all'}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, appName: value === 'all' ? '' : value })
          }
        >
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Aplicativo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos aplicativos</SelectItem>
            {apps.map((app) => (
              <SelectItem key={app} value={app}>
                {app}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date From */}
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'w-[140px] justify-start text-left font-normal h-9',
                !filters.dateFrom && 'text-muted-foreground'
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {filters.dateFrom ? format(filters.dateFrom, 'dd/MM/yyyy', { locale: ptBR }) : 'De'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={filters.dateFrom}
              onSelect={(date) => onFiltersChange({ ...filters, dateFrom: date })}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Date To */}
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'w-[140px] justify-start text-left font-normal h-9',
                !filters.dateTo && 'text-muted-foreground'
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {filters.dateTo ? format(filters.dateTo, 'dd/MM/yyyy', { locale: ptBR }) : 'Até'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={filters.dateTo}
              onSelect={(date) => onFiltersChange({ ...filters, dateTo: date })}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-9 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Limpar
        </Button>
      )}
    </div>
  );
};
