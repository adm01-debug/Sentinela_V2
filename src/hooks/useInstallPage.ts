import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useInstallPage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [agentKey, setAgentKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const agentKeysQuery = useQuery({
    queryKey: ['agent-keys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_keys')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const generateKey = async () => {
    try {
      const key = crypto.randomUUID();
      const { error } = await supabase
        .from('agent_keys')
        .insert({ key, name: 'New Agent Key' });
      if (error) throw error;
      setAgentKey(key);
      toast({ title: 'Chave gerada com sucesso' });
      agentKeysQuery.refetch();
    } catch (error: any) {
      toast({ title: 'Erro ao gerar chave', description: error.message, variant: 'destructive' });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Copiado para a área de transferência' });
    } catch {
      toast({ title: 'Erro ao copiar', variant: 'destructive' });
    }
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return {
    step,
    setStep,
    nextStep,
    prevStep,
    agentKey,
    agentKeys: agentKeysQuery.data || [],
    isLoading: agentKeysQuery.isLoading,
    generateKey,
    copyToClipboard,
    copied,
  };
}
