import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface Suggestion {
  id: string;
  type: 'action' | 'filter' | 'search' | 'navigation';
  title: string;
  description?: string;
  confidence: number;
  metadata?: Record<string, string | number | boolean>;
  action?: () => void;
}

export interface UseSmartSuggestionsOptions {
  context?: string;
  maxSuggestions?: number;
  minConfidence?: number;
}

export function useSmartSuggestions(options: UseSmartSuggestionsOptions = {}) {
  const { context, maxSuggestions = 5, minConfidence = 0.5 } = options;
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSuggestions = useCallback(async (query?: string) => {
    setIsLoading(true);
    try {
      const { data } = await supabase.functions.invoke('smart-recommendations', {
        body: { context: query || context, limit: maxSuggestions }
      });
      interface RawSuggestion {
        id?: string;
        type?: string;
        title: string;
        description?: string;
        confidence?: number;
        priority?: number;
        metrics?: Record<string, string | number | boolean>;
      }
      const filtered = (data?.recommendations || [])
        .filter((s: RawSuggestion) => (s.confidence || (s.priority || 0) / 100) >= minConfidence)
        .map((s: RawSuggestion) => ({
          id: s.id || crypto.randomUUID(),
          type: (s.type || 'action') as Suggestion['type'],
          title: s.title,
          description: s.description,
          confidence: s.confidence || (s.priority || 0) / 100,
          metadata: s.metrics,
        }));
      setSuggestions(filtered);
    } catch (e) {
      logger.error('Failed to fetch suggestions:', e);
    } finally {
      setIsLoading(false);
    }
  }, [context, maxSuggestions, minConfidence]);

  const dismissSuggestion = useCallback((id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
  }, []);

  const acceptSuggestion = useCallback((suggestion: Suggestion) => {
    suggestion.action?.();
    dismissSuggestion(suggestion.id);
  }, [dismissSuggestion]);

  return { suggestions, isLoading, fetchSuggestions, dismissSuggestion, acceptSuggestion };
}

export default useSmartSuggestions;
