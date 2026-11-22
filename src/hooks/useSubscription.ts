import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface Subscription {
  id: string;
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  features: string[];
}

type SubscriptionRow = {
  id: string;
  plan: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  features: string[] | null;
};

// O banco guarda snake_case; a interface do hook e camelCase. Mapear evita
// current_period_end/cancel_at_period_end chegando undefined no consumidor.
function rowToSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    plan: row.plan as Subscription['plan'],
    status: row.status as Subscription['status'],
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    features: row.features ?? [],
  };
}

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
  isPlan: (plan: Subscription['plan']) => boolean;
  hasFeature: (feature: string) => boolean;
  isActive: boolean;
  refresh: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!user?.id) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
      setSubscription(data ? rowToSubscription(data as SubscriptionRow) : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const isPlan = useCallback((plan: Subscription['plan']): boolean => {
    return subscription?.plan === plan;
  }, [subscription]);

  const hasFeature = useCallback((feature: string): boolean => {
    return subscription?.features?.includes(feature) ?? false;
  }, [subscription]);

  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';

  return {
    subscription,
    isLoading,
    error,
    isPlan,
    hasFeature,
    isActive,
    refresh: fetchSubscription,
  };
}

export default useSubscription;
