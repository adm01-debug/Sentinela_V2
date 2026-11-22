import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BrandedSplash } from "@/components/ui/LoadingSpinner";
import { MFAVerify } from "@/components/MFAVerify";
import { logger } from "@/lib/logger";

interface MFAGuardProps {
  children: ReactNode;
}

type Gate = "checking" | "open" | "challenge";

/**
 * Exige o segundo fator quando a conta tem MFA cadastrado.
 *
 * `getAuthenticatorAssuranceLevel` devolve `nextLevel: 'aal2'` exatamente quando
 * existe fator verificado na conta e a sessao atual so passou pelo primeiro
 * fator. Sem este guard o fator cadastrado em Configuracoes > Seguranca nao
 * bloqueava nada: qualquer senha valida entrava no sistema.
 *
 * Falha aberta de proposito: se a Auth API nao responder, o usuario segue para o
 * app. Prender todo mundo fora por indisponibilidade do provedor seria pior do
 * que o risco que o guard cobre, e o RLS continua valendo.
 */
export function MFAGuard({ children }: MFAGuardProps) {
  const [gate, setGate] = useState<Gate>("checking");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (cancelled) return;
        if (error) {
          logger.error("Failed to read assurance level:", error);
          setGate("open");
          return;
        }
        const needsSecondFactor = data?.nextLevel === "aal2" && data?.currentLevel !== "aal2";
        setGate(needsSecondFactor ? "challenge" : "open");
      } catch (err) {
        if (cancelled) return;
        logger.error("Failed to read assurance level:", err);
        setGate("open");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (gate === "checking") {
    return <BrandedSplash />;
  }

  if (gate === "challenge") {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center p-4">
        <MFAVerify onVerified={() => setGate("open")} />
      </div>
    );
  }

  return <>{children}</>;
}
