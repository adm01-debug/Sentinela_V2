import { memo, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { X, Filter, ChevronDown, Calendar, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ============================================================
// TYPES
// ============================================================

type FilterType = 'select' | 'multiselect' | 'text' | 'date' | 'daterange' | 'number';

interface FilterOption {
  label: string;
  value: string;
  count?: number;
  icon?: React.ComponentType<{ className?: string }>;
}

interface FilterConfig {
  id: string;
  label: string;
  type: FilterType;
  options?: FilterOption[];
  placeholder?: string;
  defaultValue?: any;
}

interface FilterPreset {
  id: string;
  name: string;
  filters: Record<string, any>;
}

interface ActiveFilter {
  id: string;
  label: string;
  value: any;
  displayValue: string;
}

interface FilterBarProps {
  filters: FilterConfig[];
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  presets?: FilterPreset[];
  onSavePreset?: (name: string, filters: Record<string, any>) => void;
  onDeletePreset?: (presetId: string) => void;
  showActiveFilters?: boolean;
  className?: string;
}

// ============================================================
// FILTER COMPONENTS
// ============================================================

interface SelectFilterProps {
  config: FilterConfig;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}

const SelectFilter = memo(function SelectFilter({
  config,
  value,
  onChange,
}: SelectFilterProps) {
  return (
    <Select value={value || ''} onValueChange={(v) => onChange(v || undefined)}>
      <SelectTrigger className="h-9 min-w-[140px]">
        <SelectValue placeholder={config.placeholder || config.label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">Todos</SelectItem>
        {config.options?.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              {option.icon && <option.icon className="h-4 w-4" />}
              <span>{option.label}</span>
              {option.count !== undefined && (
                <span className="ml-auto text-xs text-muted-foreground">
                  {option.count}
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});

interface DateFilterProps {
  config: FilterConfig;
  value: Date | undefined;
  onChange: (value: Date | undefined) => void;
}

const DateFilter = memo(function DateFilter({
  config,
  value,
  onChange,
}: DateFilterProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-9 min-w-[140px] justify-start font-normal">
          <Calendar className="mr-2 h-4 w-4" />
          {value ? format(value, 'dd/MM/yyyy', { locale: ptBR }) : config.placeholder || config.label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarComponent
          mode="single"
          selected={value}
          onSelect={onChange}
          locale={ptBR}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
});

interface TextFilterProps {
  config: FilterConfig;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}

const TextFilter = memo(function TextFilter({
  config,
  value,
  onChange,
}: TextFilterProps) {
  return (
    <Input
      type="text"
      placeholder={config.placeholder || config.label}
      value={value || ''}
      onChange={(e) => onChange(e.target.value || undefined)}
      className="h-9 min-w-[140px] max-w-[200px]"
    />
  );
});

interface NumberFilterProps {
  config: FilterConfig;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

const NumberFilter = memo(function NumberFilter({
  config,
  value,
  onChange,
}: NumberFilterProps) {
  return (
    <Input
      type="number"
      placeholder={config.placeholder || config.label}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
      className="h-9 w-[100px]"
    />
  );
});

// ============================================================
// ACTIVE FILTERS CHIPS
// ============================================================

interface ActiveFiltersChipsProps {
  filters: ActiveFilter[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

const ActiveFiltersChips = memo(function ActiveFiltersChips({
  filters,
  onRemove,
  onClearAll,
}: ActiveFiltersChipsProps) {
  if (filters.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground font-medium">Filtros:</span>
      {filters.map((filter) => (
        <Badge
          key={filter.id}
          variant="secondary"
          className="gap-1 pr-1 hover:bg-secondary/80"
        >
          <span className="text-muted-foreground">{filter.label}:</span>
          <span className="font-medium">{filter.displayValue}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
            onClick={() => onRemove(filter.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
        onClick={onClearAll}
      >
        Limpar todos
      </Button>
    </div>
  );
});

// ============================================================
// PRESETS DROPDOWN
// ============================================================

interface PresetsDropdownProps {
  presets: FilterPreset[];
  currentFilters: Record<string, any>;
  onApplyPreset: (preset: FilterPreset) => void;
  onSavePreset?: (name: string) => void;
  onDeletePreset?: (presetId: string) => void;
}

const PresetsDropdown = memo(function PresetsDropdown({
  presets,
  currentFilters,
  onApplyPreset,
  onSavePreset,
  onDeletePreset,
}: PresetsDropdownProps) {
  const [newPresetName, setNewPresetName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const hasActiveFilters = Object.values(currentFilters).some((v) => v !== undefined);

  const handleSave = useCallback(() => {
    if (newPresetName.trim() && onSavePreset) {
      onSavePreset(newPresetName.trim());
      setNewPresetName('');
      setIsCreating(false);
    }
  }, [newPresetName, onSavePreset]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Save className="mr-2 h-4 w-4" />
          Presets
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {presets.length > 0 && (
          <>
            {presets.map((preset) => (
              <div key={preset.id} className="flex items-center">
                <DropdownMenuItem
                  className="flex-1"
                  onClick={() => onApplyPreset(preset)}
                >
                  {preset.name}
                </DropdownMenuItem>
                {onDeletePreset && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePreset(preset.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
            <DropdownMenuSeparator />
          </>
        )}

        {isCreating ? (
          <div className="p-2 space-y-2">
            <Input
              placeholder="Nome do preset"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              className="h-8"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" className="h-7 flex-1" onClick={handleSave}>
                Salvar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7"
                onClick={() => setIsCreating(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <DropdownMenuItem
            disabled={!hasActiveFilters}
            onClick={() => setIsCreating(true)}
          >
            <Save className="mr-2 h-4 w-4" />
            Salvar preset atual
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

// ============================================================
// MAIN COMPONENT
// ============================================================

function FilterBarComponent({
  filters,
  values,
  onChange,
  presets = [],
  onSavePreset,
  onDeletePreset,
  showActiveFilters = true,
  className,
}: FilterBarProps) {
  const handleFilterChange = useCallback(
    (filterId: string, value: any) => {
      onChange({
        ...values,
        [filterId]: value,
      });
    },
    [values, onChange]
  );

  const handleRemoveFilter = useCallback(
    (filterId: string) => {
      const newValues = { ...values };
      delete newValues[filterId];
      onChange(newValues);
    },
    [values, onChange]
  );

  const handleClearAll = useCallback(() => {
    onChange({});
  }, [onChange]);

  const handleApplyPreset = useCallback(
    (preset: FilterPreset) => {
      onChange(preset.filters);
    },
    [onChange]
  );

  const handleSavePreset = useCallback(
    (name: string) => {
      onSavePreset?.(name, values);
    },
    [onSavePreset, values]
  );

  // Build active filters for display
  const activeFilters = useMemo((): ActiveFilter[] => {
    return Object.entries(values)
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([id, value]) => {
        const config = filters.find((f) => f.id === id);
        if (!config) return null;

        let displayValue = String(value);
        if (config.type === 'select' || config.type === 'multiselect') {
          const option = config.options?.find((o) => o.value === value);
          displayValue = option?.label || displayValue;
        } else if (config.type === 'date' && value instanceof Date) {
          displayValue = format(value, 'dd/MM/yyyy', { locale: ptBR });
        }

        return {
          id,
          label: config.label,
          value,
          displayValue,
        };
      })
      .filter(Boolean) as ActiveFilter[];
  }, [values, filters]);

  const renderFilter = useCallback(
    (config: FilterConfig) => {
      const value = values[config.id];

      switch (config.type) {
        case 'select':
          return (
            <SelectFilter
              key={config.id}
              config={config}
              value={value}
              onChange={(v) => handleFilterChange(config.id, v)}
            />
          );
        case 'date':
          return (
            <DateFilter
              key={config.id}
              config={config}
              value={value}
              onChange={(v) => handleFilterChange(config.id, v)}
            />
          );
        case 'text':
          return (
            <TextFilter
              key={config.id}
              config={config}
              value={value}
              onChange={(v) => handleFilterChange(config.id, v)}
            />
          );
        case 'number':
          return (
            <NumberFilter
              key={config.id}
              config={config}
              value={value}
              onChange={(v) => handleFilterChange(config.id, v)}
            />
          );
        default:
          return null;
      }
    },
    [values, handleFilterChange]
  );

  return (
    <div className={cn('space-y-3', className)}>
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filtros:</span>
        </div>

        {filters.map(renderFilter)}

        {/* Presets */}
        {(presets.length > 0 || onSavePreset) && (
          <PresetsDropdown
            presets={presets}
            currentFilters={values}
            onApplyPreset={handleApplyPreset}
            onSavePreset={onSavePreset ? handleSavePreset : undefined}
            onDeletePreset={onDeletePreset}
          />
        )}
      </div>

      {/* Active Filters */}
      {showActiveFilters && (
        <ActiveFiltersChips
          filters={activeFilters}
          onRemove={handleRemoveFilter}
          onClearAll={handleClearAll}
        />
      )}
    </div>
  );
}

export const FilterBar = memo(FilterBarComponent);

// ============================================================
// QUICK FILTER TABS
// ============================================================

interface QuickFilterOption {
  label: string;
  value: string;
  count?: number;
}

interface QuickFilterTabsProps {
  options: QuickFilterOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

function QuickFilterTabsComponent({
  options,
  value,
  onChange,
  className,
}: QuickFilterTabsProps) {
  return (
    <div className={cn('flex items-center gap-1 p-1 bg-muted/50 rounded-lg', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
            value === option.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {option.label}
          {option.count !== undefined && (
            <Badge variant="secondary" className="ml-2 h-5 px-1.5">
              {option.count}
            </Badge>
          )}
        </button>
      ))}
    </div>
  );
}

export const QuickFilterTabs = memo(QuickFilterTabsComponent);
