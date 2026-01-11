import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { debounce } from 'lodash';
export const useSearch = (query) => {
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  useEffect(() => {
    if (!query || query.length < 2) { setResults([]); return; }
    const search = debounce(async () => {
      setIsSearching(true);
      try { const data = await apiClient.get('/search', { q: query }); setResults(data); }
      finally { setIsSearching(false); }
    }, 300);
    search();
    return () => search.cancel();
  }, [query]);
  return { results, isSearching };
};