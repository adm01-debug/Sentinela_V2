import * as React from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, Loader2, Search } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { logger } from '@/lib/logger';

export interface SearchAutocompleteOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SearchAutocompleteProps {
  options?: SearchAutocompleteOption[];
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => Promise<SearchAutocompleteOption[]>;
  placeholder?: string;
  emptyMessage?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  debounceMs?: number;
  minChars?: number;
  maxResults?: number;
  clearable?: boolean;
  renderOption?: (option: SearchAutocompleteOption) => React.ReactNode;
}

export function SearchAutocomplete({
  options: staticOptions = [],
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  emptyMessage = 'No results found.',
  loading: externalLoading = false,
  disabled = false,
  className,
  debounceMs = 300,
  minChars = 1,
  maxResults = 10,
  clearable = true,
  renderOption,
}: SearchAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<SearchAutocompleteOption[]>(staticOptions);
  const [internalLoading, setInternalLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const debouncedQuery = useDebounce(query, debounceMs);
  const isLoading = externalLoading || internalLoading;

  const selectedOption = options.find(opt => opt.value === value);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!onSearch || searchQuery.length < minChars) {
      setOptions(staticOptions.filter(opt => 
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      ));
      return;
    }

    setInternalLoading(true);
    try {
      const results = await onSearch(searchQuery);
      setOptions(results.slice(0, maxResults));
    } catch (error) {
      logger.error('Search error:', error);
      setOptions([]);
    } finally {
      setInternalLoading(false);
    }
  }, [onSearch, staticOptions, minChars, maxResults]);

  useEffect(() => {
    handleSearch(debouncedQuery);
  }, [debouncedQuery, handleSearch]);

  useEffect(() => {
    if (!onSearch) setOptions(staticOptions);
  }, [staticOptions, onSearch]);

  const handleSelect = (selectedValue: string) => {
    const newValue = clearable && selectedValue === value ? '' : selectedValue;
    onChange?.(newValue);
    setOpen(false);
    setQuery('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full justify-between', className)}
        >
          <span className="flex items-center gap-2 truncate">
            {selectedOption?.icon}
            {selectedOption?.label || placeholder}
          </span>
          {isLoading ? (
            <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              ref={inputRef}
              placeholder={placeholder}
              value={query}
              onValueChange={setQuery}
              className="border-0 focus:ring-0"
            />
          </div>
          <CommandList>
            {isLoading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
            {!isLoading && options.length === 0 && (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            )}
            {!isLoading && options.length > 0 && (
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    disabled={option.disabled}
                    className="cursor-pointer"
                  >
                    {renderOption ? renderOption(option) : (
                      <div className="flex items-center gap-2 flex-1">
                        {option.icon}
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          {option.description && (
                            <span className="text-xs text-muted-foreground">{option.description}</span>
                          )}
                        </div>
                      </div>
                    )}
                    <Check className={cn('ml-auto h-4 w-4', value === option.value ? 'opacity-100' : 'opacity-0')} />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default SearchAutocomplete;
