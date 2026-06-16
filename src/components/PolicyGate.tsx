import { useState, useEffect, ReactNode } from "react";
import { Shield, AlertTriangle, Lock } from "lucide-react";
import { PolicyAcknowledgmentDialog } from "./PolicyAcknowledgmentDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { logger } from "@/lib/logger";

interface PolicyGateProps {
  children: ReactNode;
}

export function PolicyGate({ children }: PolicyGateProps) {
  const [hasAcknowledgedToday, setHasAcknowledgedToday] = useState<boolean | null>(null);
  const [isExempt, setIsExempt] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Get employee name from user data - handle different possible structures
  const employeeName = user?.name || user?.email || "Funcionário";

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const checkExemption = async () => {
    if (!employeeName || !user?.email) return false;

    try {
      const { data, error } = await supabase
        .from("policy_exemptions")
        .select("id, expires_at")
        .or(`employee_name.eq.${employeeName},employee_name.eq.${user.email}`)
        .limit(1);

      if (!error && data && data.length > 0) {
        const exemption = data[0];
        if (exemption.expires_at) {
          const expiresAt = new Date(exemption.expires_at);
          if (expiresAt < new Date()) {
            return false;
          }
        }
        return true;
      }
      return false;
    } catch (err) {
      logger.error("Failed to check exemption:", err);
      return false;
    }
  };

  const checkAcknowledgment = async () => {
    if (!employeeName) {
      setLoading(false);
      return;
    }

    try {
      const exempt = await checkExemption();
      setIsExempt(exempt);

      if (exempt) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("policy_acknowledgments")
        .select("id, acknowledged_at")
        .eq("employee_name", employeeName)
        .order("acknowledged_at", { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        const lastDate = new Date(data[0].acknowledged_at);
        setHasAcknowledgedToday(isToday(lastDate));
      } else {
        setHasAcknowledgedToday(false);
      }
    } catch (err) {
      logger.error("Failed to check acknowledgment:", err);
      setHasAcknowledgedToday(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAcknowledgment();
    // checkAcknowledgment is recreated each render; re-running only on employeeName change is intended
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeName]);

  const handleAcknowledged = () => {
    setHasAcknowledgedToday(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-muted-foreground">Verificando confirmação de políticas...</p>
        </div>
      </div>
    );
  }

  if (isExempt) {
    return <>{children}</>;
  }

  if (hasAcknowledgedToday === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-lg">
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pb-8 pt-8">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                  <Lock className="h-8 w-8 text-destructive" />
                </div>
                <h1 className="mb-2 text-2xl font-bold">Acesso Bloqueado</h1>
                <p className="text-muted-foreground">
                  Você precisa confirmar as políticas de monitoramento diariamente para acessar o
                  sistema.
                </p>
              </div>

              <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                  <div className="text-sm">
                    <p className="mb-1 font-medium text-amber-400">Confirmação Obrigatória</p>
                    <p className="text-muted-foreground">
                      Esta confirmação inclui captura de foto em tempo real e sua localização atual.
                      Esses dados são necessários para validar sua identidade e registrar o aceite
                      das políticas.
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
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <Shield className="h-4 w-4" />
                  Ver Políticas de Monitoramento
                </a>
              </div>
            </CardContent>
          </Card>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Em caso de dúvidas, entre em contato com o departamento de TI.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
