import { useState, useEffect, ReactNode } from "react";
import { Shield, AlertTriangle, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { PolicyAcknowledgmentDialog } from "./PolicyAcknowledgmentDialog";

interface PolicyGateProps {
  children: ReactNode;
}

// A RPC responde apenas pelo proprio usuario (security definer). Ler a tabela
// direto nao funciona: a RLS de SELECT e admin-only, e era isso que trancava
// todo mundo na PR #223.
//
// O gate e fail-open de proposito: se a consulta falhar, o acesso e liberado.
// Um gate de conformidade nunca pode virar lockout do sistema -- o aceite
// continua sendo cobrado na pagina de Compliance.
async function fetchAcknowledgmentStatus(userId?: string): Promise<{
  hasAcknowledgedToday: boolean;
  isExempt: boolean;
}> {
  if (!userId) return { hasAcknowledgedToday: true, isExempt: false };

  try {
    const { data, error } = await supabase.rpc("my_policy_acknowledgment_status");

    if (error) {
      logger.error("Failed to check acknowledgment:", error);
      return { hasAcknowledgedToday: true, isExempt: true };
    }

    const status = Array.isArray(data) ? data[0] : data;

    if (!status) return { hasAcknowledgedToday: true, isExempt: true };

    const isExempt = status.is_exempt === true;
    return { hasAcknowledgedToday: isExempt || status.has_acknowledged_today === true, isExempt };
  } catch (err) {
    logger.error("Failed to check acknowledgment:", err);
    return { hasAcknowledgedToday: true, isExempt: true };
  }
}

export function PolicyGate({ children }: PolicyGateProps) {
  const [hasAcknowledgedToday, setHasAcknowledgedToday] = useState<boolean | null>(null);
  const [isExempt, setIsExempt] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Get employee name from user data - handle different possible structures
  const employeeName = user?.name || user?.email || "Funcionário";

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const status = await fetchAcknowledgmentStatus(user?.id);
      if (cancelled) return;

      setIsExempt(status.isExempt);
      setHasAcknowledgedToday(status.hasAcknowledgedToday);
      setLoading(false);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const handleAcknowledged = () => {
    setHasAcknowledgedToday(true);
  };

  if (loading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2" />
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
      <div className="bg-background flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-8 pb-8">
              <div className="mb-6 text-center">
                <div className="bg-destructive/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <Lock className="text-destructive h-8 w-8" />
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
                  className="text-primary flex items-center gap-1 text-sm hover:underline"
                >
                  <Shield className="h-4 w-4" />
                  Ver Políticas de Monitoramento
                </a>
              </div>
            </CardContent>
          </Card>

          <p className="text-muted-foreground mt-4 text-center text-xs">
            Em caso de dúvidas, entre em contato com o departamento de TI.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
