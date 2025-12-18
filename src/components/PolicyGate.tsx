import { useState, useEffect, ReactNode } from 'react';
import { Shield, AlertTriangle, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PolicyAcknowledgmentDialog } from './PolicyAcknowledgmentDialog';
import { Card, CardContent } from '@/components/ui/card';

interface PolicyGateProps {
  children: ReactNode;
}

export function PolicyGate({ children }: PolicyGateProps) {
  const [hasAcknowledgedToday, setHasAcknowledgedToday] = useState<boolean | null>(null);
  const [isExempt, setIsExempt] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const employeeName = user?.user_metadata?.full_name || user?.email || 'Funcionário';

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const checkExemption = async () => {
    if (!employeeName || !user?.email) return false;

    try {
      const { data, error } = await supabase
        .from('policy_exemptions')
        .select('id, expires_at')
        .or(`employee_name.eq.${employeeName},employee_name.eq.${user.email}`)
        .limit(1);

      if (!error && data && data.length > 0) {
        const exemption = data[0];
        // Check if exemption has expired
        if (exemption.expires_at) {
          const expiresAt = new Date(exemption.expires_at);
          if (expiresAt < new Date()) {
            return false; // Expired
          }
        }
        return true; // Valid exemption
      }
      return false;
    } catch (err) {
      console.error('Failed to check exemption:', err);
      return false;
    }
  };

  const checkAcknowledgment = async () => {
    if (!employeeName) {
      setLoading(false);
      return;
    }

    try {
      // First check if user is exempt
      const exempt = await checkExemption();
      setIsExempt(exempt);

      if (exempt) {
        setLoading(false);
        return;
      }

      // If not exempt, check for daily acknowledgment
      const { data, error } = await supabase
        .from('policy_acknowledgments')
        .select('id, acknowledged_at')
        .eq('employee_name', employeeName)
        .order('acknowledged_at', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        const lastDate = new Date(data[0].acknowledged_at);
        setHasAcknowledgedToday(isToday(lastDate));
      } else {
        setHasAcknowledgedToday(false);
      }
    } catch (err) {
      console.error('Failed to check acknowledgment:', err);
      setHasAcknowledgedToday(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAcknowledgment();
  }, [employeeName]);

  const handleAcknowledged = () => {
    setHasAcknowledgedToday(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando confirmação de políticas...</p>
        </div>
      </div>
    );
  }

  // User is exempt - grant access
  if (isExempt) {
    return <>{children}</>;
  }

  // Block access if not acknowledged today
  if (hasAcknowledgedToday === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          {/* Blocked Access Card */}
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-8 pb-8">
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <Lock className="h-8 w-8 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Acesso Bloqueado</h1>
                <p className="text-muted-foreground">
                  Você precisa confirmar as políticas de monitoramento diariamente para acessar o sistema.
                </p>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-400 mb-1">Confirmação Obrigatória</p>
                    <p className="text-muted-foreground">
                      Esta confirmação inclui captura de foto em tempo real e sua localização atual. 
                      Esses dados são necessários para validar sua identidade e registrar o aceite das políticas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <PolicyAcknowledgmentDialog 
                  employeeName={employeeName} 
                  onAcknowledged={handleAcknowledged}
                />
                
                <a 
                  href="/monitoring-policies" 
                  target="_blank"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <Shield className="h-4 w-4" />
                  Ver Políticas de Monitoramento
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            Em caso de dúvidas, entre em contato com o departamento de TI.
          </p>
        </div>
      </div>
    );
  }

  // Access granted
  return <>{children}</>;
}