import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  description?: string;
  score: number;
  metadata?: unknown;
}

export interface UseNaturalLanguageSearchOptions {
  tables?: string[];
  maxResults?: number;
  minScore?: number;
}

export function useNaturalLanguageSearch(options: UseNaturalLanguageSearchOptions = {}) {
  const { tables = ['employees', 'activities', 'violations'], maxResults = 20, minScore = 0.5 } = options;
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastQuery, setLastQuery] = useState('');

  const search = useCallback(async (query: string) => {
    if (!query.trim()) { setResults([]); return; }
    setIsSearching(true);
    setError(null);
    setLastQuery(query);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('analyze-activity', {
        body: { type: 'natural-language-search', query, tables, maxResults }
      });
      if (fnError) throw fnError;
      setResults((data?.results || []).filter((r: SearchResult) => r.score >= minScore));
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Search failed'));
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [tables, maxResults, minScore]);

  const clearResults = useCallback(() => { setResults([]); setLastQuery(''); }, []);

  return { results, isSearching, error, search, clearResults, lastQuery, resultCount: results.length };
}

export default useNaturalLanguageSearch;
