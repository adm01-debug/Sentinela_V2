import { memo } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRangePicker } from '@/components/DateRangePicker';
import type { Policy } from '@/hooks/usePolicyAcknowledgments';

interface PolicyFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedPolicy: string;
  onPolicyChange: (value: string) => void;
  policies: Policy[];
  dateRange?: { from: Date; to: Date };
  onDateRangeChange: (range: { from: Date; to: Date } | undefined) => void;
  onClearFilters: () => void;
}

function PolicyFiltersComponent({
  searchTerm,
  onSearchChange,
  selectedPolicy,
  onPolicyChange,
  policies,
  dateRange,
  onDateRangeChange,
  onClearFilters,
}: PolicyFiltersProps) {
  const hasFilters = searchTerm || selectedPolicy !== 'all' || dateRange;

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por funcionário..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="w-[200px]">
        <Select value={selectedPolicy} onValueChange={onPolicyChange}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por política" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as políticas</SelectItem>
            {policies.map((policy) => (
              <SelectItem key={policy.id} value={policy.id}>
                {policy.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DateRangePicker
        value={dateRange}
        onChange={onDateRangeChange}
      />

      {hasFilters && (
        <Button variant="ghost" onClick={onClearFilters}>
          <Filter className="h-4 w-4 mr-2" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}

export const PolicyFilters = memo(PolicyFiltersComponent);
