import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBillingStore } from '@/stores/billingStore';
import { logger } from '@/lib/logger';

interface CompanyPlan {
  companyName: string;
  plan: string;
  maxEmployees: number | null;
  currentEmployees: number;
  isActive: boolean;
}

export function useBilling() {
  const store = useBillingStore();

  const companyQuery = useQuery({
    queryKey: ['billing-company-plan'],
    queryFn: async (): Promise<CompanyPlan | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get user's company
      const { data: userCompany } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!userCompany) return null;

      const { data: company } = await supabase
        .from('companies')
        .select('name, plan, max_employees, is_active')
        .eq('id', userCompany.company_id)
        .maybeSingle();

      if (!company) return null;

      // Count current employees
      const { count } = await supabase
        .from('employees')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', userCompany.company_id);

      return {
        companyName: company.name,
        plan: company.plan ?? 'free',
        maxEmployees: company.max_employees,
        currentEmployees: count ?? 0,
        isActive: company.is_active ?? true,
      };
    },
    staleTime: 120_000,
  });

  const fetchBillingData = useCallback(async () => {
    await companyQuery.refetch();
  }, [companyQuery]);

  const subscribeToPlan = useCallback(async (_planId) => {
    // Billing gateway integration placeholder - would integrate with Stripe/etc
    logger.info('[Billing] Subscribe to plan:', _planId);
  }, []);

  return {
    ...store,
    companyPlan: companyQuery.data,
    isLoadingPlan: companyQuery.isLoading,
    fetchBillingData,
    subscribeToPlan,
  };
}
