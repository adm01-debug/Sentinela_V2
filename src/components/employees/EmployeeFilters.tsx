import { memo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// ============================================================
// TYPES
// ============================================================

export interface EmployeeFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (value: string) => void;
  teamFilter: string;
  onTeamFilterChange: (value: string) => void;
  departments: string[];
  teams: { id: string; name: string }[];
  activeFiltersCount: number;
  onClearFilters: () => void;
}

// ============================================================
// COMPONENT
// ============================================================

export const EmployeeFilters = memo(function EmployeeFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  departmentFilter,
  onDepartmentFilterChange,
  teamFilter,
  onTeamFilterChange,
  departments,
  teams,
  activeFiltersCount,
  onClearFilters,
}: EmployeeFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar funcionários..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Status Filter */}
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="active">Ativos</SelectItem>
          <SelectItem value="inactive">Inativos</SelectItem>
          <SelectItem value="suspended">Suspensos</SelectItem>
        </SelectContent>
      </Select>

      {/* Department Filter */}
      <Select value={departmentFilter} onValueChange={onDepartmentFilterChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Departamento" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os departamentos</SelectItem>
          {departments.map((dept) => (
            <SelectItem key={dept} value={dept}>
              {dept}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Team Filter */}
      <Select value={teamFilter} onValueChange={onTeamFilterChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Equipe" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as equipes</SelectItem>
          {teams.map((team) => (
            <SelectItem key={team.id} value={team.id}>
              {team.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Limpar ({activeFiltersCount})
        </Button>
      )}
    </div>
  );
});
