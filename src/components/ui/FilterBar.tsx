import { memo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  key: string;
  placeholder: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  onClearFilters?: () => void;
  showClear?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function FilterBarComponent({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  filters = [],
  onClearFilters,
  showClear,
  className,
  children,
}: FilterBarProps) {
  const hasActiveFilters = filters.some(f => f.value !== 'all') || (searchValue && searchValue.length > 0);

  return (
    <div className={cn("flex flex-wrap gap-4", className)}>
      {onSearchChange && (
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {filters.map((filter) => (
        <Select key={filter.key} value={filter.value} onValueChange={filter.onChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={filter.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {showClear && hasActiveFilters && onClearFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          <X className="h-4 w-4 mr-1" />
          Limpar
        </Button>
      )}

      {children}
    </div>
  );
}

export const FilterBar = memo(FilterBarComponent);
