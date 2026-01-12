import { useState } from 'react';
import { useSearchStore } from '@/stores/searchStore';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

export function GlobalSearch() {
  const { query, setQuery, results, isLoading, search, clear } = useSearchStore();
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.length >= 2) search(value);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Buscar..."
        value={query}
        onChange={e => handleSearch(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        className="pl-9 pr-9"
      />
      {query && (
        <button onClick={clear} className="absolute right-3 top-1/2 -translate-y-1/2">
          <X className="h-4 w-4" />
        </button>
      )}
      {isFocused && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-background border rounded-md shadow-lg z-50 max-h-80 overflow-auto">
          {results.map(r => (
            <a key={r.id} href={r.url} className="block px-3 py-2 hover:bg-accent">
              <div className="font-medium">{r.title}</div>
              <div className="text-sm text-muted-foreground">{r.type}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
