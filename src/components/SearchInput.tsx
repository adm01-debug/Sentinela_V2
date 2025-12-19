import { memo, useCallback, forwardRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSearchDebounce } from '@/hooks/useDebounce';

// ============================================================
// TYPES
// ============================================================

interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
  debounceMs?: number;
  autoFocus?: boolean;
  disabled?: boolean;
  showClearButton?: boolean;
}

// ============================================================
// CONTROLLED SEARCH INPUT
// ============================================================

const SearchInputComponent = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      onSearch,
      placeholder = 'Buscar...',
      className,
      isLoading = false,
      autoFocus = false,
      disabled = false,
      showClearButton = true,
    },
    ref
  ) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange?.(newValue);
        onSearch?.(newValue);
      },
      [onChange, onSearch]
    );

    const handleClear = useCallback(() => {
      onChange?.('');
      onSearch?.('');
    }, [onChange, onSearch]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
          handleClear();
        }
      },
      [handleClear]
    );

    return (
      <div className={cn('relative', className)}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={ref}
          type="search"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={disabled}
          className="pl-10 pr-10"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {!isLoading && showClearButton && value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto p-0 hover:bg-transparent"
              onClick={handleClear}
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </Button>
          )}
        </div>
      </div>
    );
  }
);

SearchInputComponent.displayName = 'SearchInput';

export const SearchInput = memo(SearchInputComponent);

// ============================================================
// DEBOUNCED SEARCH INPUT
// ============================================================

interface DebouncedSearchInputProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  autoFocus?: boolean;
  disabled?: boolean;
}

function DebouncedSearchInputComponent({
  onSearch,
  placeholder = 'Buscar...',
  className,
  debounceMs = 300,
  autoFocus = false,
  disabled = false,
}: DebouncedSearchInputProps) {
  const {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    isSearching,
    clearSearch,
  } = useSearchDebounce(debounceMs);

  // Call onSearch when debounced value changes
  useCallback(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  return (
    <SearchInput
      value={searchTerm}
      onChange={setSearchTerm}
      placeholder={placeholder}
      className={className}
      isLoading={isSearching}
      autoFocus={autoFocus}
      disabled={disabled}
    />
  );
}

export const DebouncedSearchInput = memo(DebouncedSearchInputComponent);

// ============================================================
// SEARCH INPUT WITH SUGGESTIONS
// ============================================================

interface SearchWithSuggestionsProps extends SearchInputProps {
  suggestions?: string[];
  onSelectSuggestion?: (suggestion: string) => void;
  showSuggestions?: boolean;
}

function SearchWithSuggestionsComponent({
  suggestions = [],
  onSelectSuggestion,
  showSuggestions = true,
  ...props
}: SearchWithSuggestionsProps) {
  const handleSelect = useCallback(
    (suggestion: string) => {
      props.onChange?.(suggestion);
      onSelectSuggestion?.(suggestion);
    },
    [props.onChange, onSelectSuggestion]
  );

  return (
    <div className="relative">
      <SearchInput {...props} />
      {showSuggestions && suggestions.length > 0 && props.value && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover shadow-md">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
              onClick={() => handleSelect(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export const SearchWithSuggestions = memo(SearchWithSuggestionsComponent);
