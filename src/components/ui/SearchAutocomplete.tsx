import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Loader2, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

export interface AutocompleteOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface SearchAutocompleteProps {
  options?: AutocompleteOption[];
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: (option: AutocompleteOption) => void;
  onSearch?: (query: string) => void | Promise<void>;
  placeholder?: string;
  emptyMessage?: string;
  isLoading?: boolean;
  debounceMs?: number;
  minChars?: number;
  className?: string;
  disabled?: boolean;
  clearable?: boolean;
}

export function SearchAutocomplete({
  options = [],
  value = "",
  onChange,
  onSelect,
  onSearch,
  placeholder = "Buscar...",
  emptyMessage = "Nenhum resultado encontrado",
  isLoading = false,
  debounceMs = 300,
  minChars = 2,
  className,
  disabled = false,
  clearable = true,
}: SearchAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value);
  const debouncedValue = useDebounce(inputValue, debounceMs);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (debouncedValue.length >= minChars) {
      onSearch?.(debouncedValue);
    }
  }, [debouncedValue, minChars, onSearch]);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
    if (newValue.length >= minChars) setOpen(true);
  };

  const handleSelect = (option: AutocompleteOption) => {
    setInputValue(option.label);
    onChange?.(option.value);
    onSelect?.(option);
    setOpen(false);
  };

  const handleClear = () => {
    setInputValue("");
    onChange?.("");
    inputRef.current?.focus();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn("relative", className)}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => inputValue.length >= minChars && setOpen(true)}
            placeholder={placeholder}
            disabled={disabled}
            className="pl-9 pr-9"
          />
          {isLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
          {!isLoading && clearable && inputValue && (
            <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start">
        <Command>
          <CommandList>
            {isLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                <Loader2 className="mx-auto h-4 w-4 animate-spin mb-2" />
                Buscando...
              </div>
            ) : options.length === 0 ? (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            ) : (
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option)}
                    disabled={option.disabled}
                    className="cursor-pointer"
                  >
                    {option.icon && <span className="mr-2">{option.icon}</span>}
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      {option.description && <span className="text-xs text-muted-foreground">{option.description}</span>}
                    </div>
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
