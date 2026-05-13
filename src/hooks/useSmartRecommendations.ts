import { useState, useCallback, useMemo } from 'react';

export interface Recommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  score: number;
  reason: string;
  action?: () => void;
  metadata?: unknown;
}

export interface UseSmartRecommendationsOptions<T> {
  items: T[];
  userPreferences?: Record<string, number>;
  getItemFeatures: (item) => Record<string, number>;
  getItemId: (item) => string;
  getItemTitle: (item) => string;
  maxRecommendations?: number;
}

export function useSmartRecommendations<T>(options: UseSmartRecommendationsOptions<T>) {
  const { items, userPreferences = {}, getItemFeatures, getItemId, getItemTitle, maxRecommendations = 5 } = options;
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<Record<string, 'positive' | 'negative'>>({});

  const recommendations = useMemo(() => {
    const scored = items
      .filter(item => !dismissedIds.has(getItemId(item)))
      .map(item => {
        const features = getItemFeatures(item);
        let score = 0;
        let reasons: string[] = [];
        
        Object.entries(features).forEach(([feature, value]) => {
          const prefWeight = userPreferences[feature] || 0;
          score += value * (1 + prefWeight);
          if (prefWeight > 0 && value > 0.5) reasons.push(feature);
        });

        const id = getItemId(item);
        if (feedback[id] === 'positive') score *= 1.2;
        if (feedback[id] === 'negative') score *= 0.5;

        return {
          id,
          type: 'item',
          title: getItemTitle(item),
          description: `Recommended based on your preferences`,
          score,
          reason: reasons.length > 0 ? `Matches: ${reasons.join(', ')}` : 'General recommendation',
          metadata: { item, features },
        } as Recommendation;
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, maxRecommendations);

    return scored;
  }, [items, userPreferences, getItemFeatures, getItemId, getItemTitle, dismissedIds, feedback, maxRecommendations]);

  const dismiss = useCallback((id) => setDismissedIds(prev => new Set([...prev, id])), []);
  const provideFeedback = useCallback((id: string, type: 'like' | 'dislike') => setFeedback(prev => ({ ...prev, [id]: type })), []);
  const reset = useCallback(() => { setDismissedIds(new Set()); setFeedback({}); }, []);

  return { recommendations, dismiss, provideFeedback, reset, hasRecommendations: recommendations.length > 0 };
}

export default useSmartRecommendations;
