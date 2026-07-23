import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type DisputeCategory =
  | 'false_positive'
  | 'misclassified'
  | 'context_missing'
  | 'policy_unclear'
  | 'technical_error'
  | 'other';

export type DisputeStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'withdrawn';

export interface ViolationDispute {
  id: string;
  violation_id: string;
  company_id: string;
  employee_name: string;
  submitted_by: string | null;
  submitter_type: 'employee' | 'manager' | 'admin';
  reason: string;
  category: DisputeCategory;
  evidence_urls: string[];
  status: DisputeStatus;
  resolution_notes: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  signature_sha256: string | null;
  submitter_ip: string | null;
  submitter_device: string | null;
  created_at: string;
  updated_at: string;
}

export const DISPUTE_CATEGORY_LABEL: Record<DisputeCategory, string> = {
  false_positive: 'Falso positivo',
  misclassified: 'Classificação incorreta',
  context_missing: 'Contexto ausente',
  policy_unclear: 'Política pouco clara',
  technical_error: 'Erro técnico',
  other: 'Outros',
};

export const DISPUTE_STATUS_LABEL: Record<DisputeStatus, string> = {
  pending: 'Pendente',
  under_review: 'Em análise',
  approved: 'Aprovada',
  rejected: 'Rejeitada',
  withdrawn: 'Retirada',
};

async function sha256(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function useViolationDisputes(violationId: string | null) {
  return useQuery<ViolationDispute[]>({
    queryKey: ['violation-disputes', violationId],
    enabled: !!violationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('violation_disputes')
        .select('*')
        .eq('violation_id', violationId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ViolationDispute[];
    },
  });
}

interface CreateDisputeInput {
  violationId: string;
  companyId: string;
  employeeName: string;
  category: DisputeCategory;
  reason: string;
  evidenceUrls?: string[];
}

export function useCreateDispute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateDisputeInput) => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id ?? null;
      const payload = `${input.violationId}|${input.category}|${input.reason}|${uid ?? 'anon'}|${new Date().toISOString()}`;
      const signature = await sha256(payload);
      const { data, error } = await supabase
        .from('violation_disputes')
        .insert({
          violation_id: input.violationId,
          company_id: input.companyId,
          employee_name: input.employeeName,
          submitted_by: uid,
          submitter_type: 'employee',
          category: input.category,
          reason: input.reason,
          evidence_urls: input.evidenceUrls ?? [],
          signature_sha256: signature,
          submitter_device: navigator.userAgent.slice(0, 200),
        })
        .select()
        .maybeSingle();
      if (error) throw error;
      return data as ViolationDispute;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['violation-disputes', vars.violationId] });
      qc.invalidateQueries({ queryKey: ['violation-detail', vars.violationId] });
      qc.invalidateQueries({ queryKey: ['violations'] });
    },
  });
}

interface ResolveDisputeInput {
  disputeId: string;
  violationId: string;
  status: Exclude<DisputeStatus, 'pending'>;
  notes?: string;
}

export function useResolveDispute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ResolveDisputeInput) => {
      const { data: userRes } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('violation_disputes')
        .update({
          status: input.status,
          resolution_notes: input.notes ?? null,
          resolved_by: userRes.user?.id ?? null,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', input.disputeId)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data as ViolationDispute;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['violation-disputes', vars.violationId] });
      qc.invalidateQueries({ queryKey: ['violation-detail', vars.violationId] });
      qc.invalidateQueries({ queryKey: ['violations'] });
    },
  });
}
