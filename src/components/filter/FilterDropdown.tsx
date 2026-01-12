import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Filter, Check } from 'lucide-react';

interface FilterOption { value: string; label: string; }

interface FilterDropdownProps {
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label?: string;
}

export function FilterDropdown({ options, selected, onChange, label = 'Filtrar' }: FilterDropdownProps) {
  const toggleOption = (value: string) => {
    onChange(selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value]);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />{label}{selected.length > 0 && ` (${selected.length})`}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {options.map(opt => (
          <DropdownMenuCheckboxItem key={opt.value} checked={selected.includes(opt.value)} onCheckedChange={() => toggleOption(opt.value)}>
            {opt.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
