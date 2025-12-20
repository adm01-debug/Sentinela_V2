import { memo, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { EmployeeFilters as FiltersType } from '@/hooks/useEmployeesPage';

interface Team {
  id: string;
  name: string;
}

interface EmployeeFiltersProps {
  filters: FiltersType;
  teams: Team[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onTeamChange: (value: string) => void;
  onClearFilters: () => void;
}

function EmployeeFiltersComponent({
  filters,
  teams,
  onSearchChange,
  onStatusChange,
  onTeamChange,
  onClearFilters,
}: EmployeeFiltersProps) {
  const hasActiveFilters = 
    filters.searchTerm !== '' || 
    filters.statusFilter !== 'all' || 
    filters.teamFilter !== 'all';

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange(e.target.value);
    },
    [onSearchChange]
  );

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Input
          placeholder="Buscar por nome, email ou departamento..."
          value={filters.searchTerm}
          onChange={handleSearchChange}
          className="pl-10"
          aria-label="Buscar funcionários por nome, email ou departamento"
        />
      </div>

      <Select value={filters.statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filtrar por status do funcionário">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="active">Ativos</SelectItem>
          <SelectItem value="inactive">Inativos</SelectItem>
          <SelectItem value="vacation">Férias</SelectItem>
          <SelectItem value="leave">Afastados</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.teamFilter} onValueChange={onTeamChange}>
        <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filtrar por equipe">
          <SelectValue placeholder="Equipe" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as equipes</SelectItem>
          <SelectItem value="none">Sem equipe</SelectItem>
          {teams.map((team) => (
            <SelectItem key={team.id} value={team.id}>
              {team.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="icon" onClick={onClearFilters} aria-label="Limpar todos os filtros">
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}

export const EmployeeFilters = memo(EmployeeFiltersComponent);
