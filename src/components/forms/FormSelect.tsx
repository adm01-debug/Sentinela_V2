import * as React from 'react';
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface Option { value: string; label: string; disabled?: boolean; }

interface FormSelectProps {
  options: Option[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  maxSelections?: number;
}

export function FormSelect({ options, value, onChange, placeholder = 'Select...', multiple = false, searchable = true, disabled = false, error, className, maxSelections }: FormSelectProps) {
  const [open, setOpen] = useState(false);
  const selectedValues = multiple ? (Array.isArray(value) ? value : []) : (value ? [value] : []);

  const handleSelect = useCallback((selectedValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(selectedValue) ? selectedValues.filter(v => v !== selectedValue) : maxSelections && selectedValues.length >= maxSelections ? selectedValues : [...selectedValues, selectedValue];
      onChange?.(newValues);
    } else {
      onChange?.(selectedValue);
      setOpen(false);
    }
  }, [multiple, selectedValues, onChange, maxSelections]);

  const removeValue = useCallback((valueToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) onChange?.(selectedValues.filter(v => v !== valueToRemove));
  }, [multiple, selectedValues, onChange]);

  const selectedLabels = selectedValues.map(v => options.find(o => o.value === v)?.label || v);

  return (
    <div className={cn('space-y-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} disabled={disabled} className={cn('w-full justify-between font-normal', error && 'border-destructive', !selectedValues.length && 'text-muted-foreground')}>
            {multiple && selectedValues.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selectedLabels.map((label, i) => <Badge key={selectedValues[i]} variant="secondary" className="mr-1">{label}<X className="ml-1 h-3 w-3 cursor-pointer" onClick={(e) => removeValue(selectedValues[i], e)} /></Badge>)}
              </div>
            ) : selectedValues.length > 0 ? selectedLabels[0] : placeholder}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            {searchable && <CommandInput placeholder="Search..." />}
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup>
                {options.map(option => (
                  <CommandItem key={option.value} value={option.value} onSelect={() => handleSelect(option.value)} disabled={option.disabled}>
                    <Check className={cn('mr-2 h-4 w-4', selectedValues.includes(option.value) ? 'opacity-100' : 'opacity-0')} />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
export default FormSelect;
