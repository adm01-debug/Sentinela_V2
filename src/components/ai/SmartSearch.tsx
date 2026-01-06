import * as React from 'react';
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Search, Sparkles, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/useDebounce';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult { id: string; type: string; title: string; description?: string; score: number; }

export function SmartSearch({ placeholder = 'Search with AI...', onResultSelect, className }: { placeholder?: string; onResultSelect?: (result: SearchResult) => void; className?: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setIsSearching(true);
    try {
      const { data } = await supabase.functions.invoke('natural-language-query', { body: { query: q, maxResults: 10 } });
      setResults(data?.results || []);
    } catch { setResults([]); }
    finally { setIsSearching(false); }
  }, []);

  React.useEffect(() => { search(debouncedQuery); }, [debouncedQuery, search]);

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={query} onChange={(e) => { setQuery(e.target.value); setShowResults(true); }} onFocus={() => setShowResults(true)} placeholder={placeholder} className="pl-10 pr-10" />
        {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
        {query && !isSearching && <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => { setQuery(''); setResults([]); }}><X className="h-4 w-4" /></Button>}
      </div>
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg z-50 max-h-80 overflow-auto">
          {results.map(result => (
            <button key={result.id} onClick={() => { onResultSelect?.(result); setShowResults(false); }} className="w-full text-left px-4 py-3 hover:bg-muted border-b last:border-0">
              <div className="flex items-center justify-between">
                <span className="font-medium">{result.title}</span>
                <Badge variant="secondary">{result.type}</Badge>
              </div>
              {result.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{result.description}</p>}
              <div className="text-xs text-muted-foreground mt-1">Relevance: {(result.score * 100).toFixed(0)}%</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
export default SmartSearch;
