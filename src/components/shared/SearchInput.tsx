// ============================================================
// SEARCH INPUT COMPONENT
// Input de busca com debounce, loading e clear
// ============================================================

import { useState, useEffect, useCallback, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  minChars?: number;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
  showClearButton?: boolean;
  showSearchIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================
// DEBOUNCE HOOK
// ============================================================

function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
): T {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutId) clearTimeout(timeoutId);

      const newTimeoutId = setTimeout(() => {
        callback(...args);
      }, delay);

      setTimeoutId(newTimeoutId);
    }) as T,
    [callback, delay, timeoutId]
  );
}

// ============================================================
// COMPONENT
// ============================================================

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value: controlledValue,
      onChange,
      onSearch,
      placeholder = 'Buscar...',
      debounceMs = 300,
      minChars = 2,
      isLoading = false,
      disabled = false,
      className,
      inputClassName,
      autoFocus = false,
      showClearButton = true,
      showSearchIcon = true,
      size = 'md',
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState('');
    const value = controlledValue ?? internalValue;

    // Debounced search callback
    const debouncedSearch = useDebouncedCallback((term: string) => {
      if (onSearch && term.length >= minChars) {
        onSearch(term);
      }
    }, debounceMs);

    // Handle value change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }

      onChange?.(newValue);
      debouncedSearch(newValue);
    };

    // Handle clear
    const handleClear = () => {
      if (controlledValue === undefined) {
        setInternalValue('');
      }

      onChange?.('');
      onSearch?.('');
    };

    // Handle key press
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        handleClear();
      } else if (e.key === 'Enter') {
        onSearch?.(value);
      }
    };

    // Size classes
    const sizeClasses = {
      sm: 'h-8 text-sm',
      md: 'h-10',
      lg: 'h-12 text-lg',
    };

    const iconSizeClasses = {
      sm: 'h-3.5 w-3.5',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    };

    const paddingClasses = {
      sm: showSearchIcon ? 'pl-8' : 'pl-3',
      md: showSearchIcon ? 'pl-10' : 'pl-4',
      lg: showSearchIcon ? 'pl-12' : 'pl-5',
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
      <div className={cn('relative', className)}>
        {/* Search Icon */}
        {showSearchIcon && (
          <div
            className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none',
              disabled && 'opacity-50'
            )}
          >
            {isLoading ? (
              <Loader2 className={cn(iconSizeClasses[size], 'animate-spin')} />
            ) : (
              <Search className={iconSizeClasses[size]} />
            )}
          </div>
        )}

        {/* Input */}
        <Input
          ref={ref}
          type="search"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={cn(
            sizeClasses[size],
            paddingClasses[size],
            showClearButton && value && 'pr-10',
            '[&::-webkit-search-cancel-button]:hidden',
            inputClassName
          )}
        />

        {/* Clear Button */}
        {showClearButton && value && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute right-1 top-1/2 -translate-y-1/2',
              size === 'sm' && 'h-6 w-6',
              size === 'md' && 'h-8 w-8',
              size === 'lg' && 'h-10 w-10'
            )}
            onClick={handleClear}
            disabled={disabled}
            tabIndex={-1}
          >
            <X className={iconSizeClasses[size]} />
            <span className="sr-only">Limpar busca</span>
          </Button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

// ============================================================
// VARIANTS
// ============================================================

export function SearchInputCompact(props: Omit<SearchInputProps, 'size'>) {
  return <SearchInput {...props} size="sm" />;
}

export function SearchInputLarge(props: Omit<SearchInputProps, 'size'>) {
  return <SearchInput {...props} size="lg" />;
}

export default SearchInput;
