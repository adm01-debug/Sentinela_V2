// ============================================================
// UNIFIED MFA PANEL
// Consolida enroll, verify e unenroll de fatores MFA (TOTP + SMS)
// em uma única interface com navegação por views e confirmações.
// ============================================================

import { memo, useCallback, useMemo, useState } from 'react';
import { useMFA } from '@/hooks/useMFA';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Key, Plus, ShieldAlert, ShieldCheck, Smartphone, Trash2 } from 'lucide-react';
import { MFAEnroll } from '@/components/MFAEnroll';
import { toast } from 'sonner';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

type View = 'status' | 'enroll';

interface FactorRow {
  id: string;
  friendly_name?: string | null;
  factor_type: 'totp' | 'phone' | (string & {});
  status: 'verified' | 'unverified' | (string & {});
}

// ------------------------------------------------------------
// Presentational helpers
// ------------------------------------------------------------

function factorLabel(type: FactorRow['factor_type']): string {
  if (type === 'totp') return 'App Autenticador (TOTP)';
  if (type === 'phone') return 'SMS';
  return String(type).toUpperCase();
}

function FactorIcon({ type }: { type: FactorRow['factor_type'] }) {
  const Icon = type === 'phone' ? Smartphone : Key;
  return <Icon className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />;
}

// ------------------------------------------------------------
// Main component
// ------------------------------------------------------------

function UnifiedMFAPanelBase() {
  const { isEnrolled, factors, loading, unenroll, checkMFAStatus } = useMFA();

  const [view, setView] = useState<View>('status');
  const [factorToRemove, setFactorToRemove] = useState<FactorRow | null>(null);
  const [removing, setRemoving] = useState(false);

  const rows = useMemo<FactorRow[]>(
    () => (Array.isArray(factors) ? (factors as FactorRow[]) : []),
    [factors],
  );

  const handleEnrolled = useCallback(() => {
    setView('status');
    checkMFAStatus();
    toast.success('Fator MFA ativado com sucesso');
  }, [checkMFAStatus]);

  const handleCancelEnroll = useCallback(() => setView('status'), []);

  const confirmRemove = useCallback(async () => {
    if (!factorToRemove) return;
    setRemoving(true);
    const { error } = await unenroll(factorToRemove.id);
    setRemoving(false);
    if (error) {
      toast.error(error.message || 'Não foi possível remover o fator');
      return;
    }
    toast.success('Fator removido com sucesso');
    setFactorToRemove(null);
    checkMFAStatus();
  }, [factorToRemove, unenroll, checkMFAStatus]);

  // Enroll view ------------------------------------------------
  if (view === 'enroll') {
    return <MFAEnroll onEnrolled={handleEnrolled} onCancel={handleCancelEnroll} />;
  }

  // Status view ------------------------------------------------
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" aria-hidden="true" />
            Autenticação Multi-Fator
          </CardTitle>
          <CardDescription>
            Gerencie seus métodos de verificação em duas etapas
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-3" aria-busy="true" aria-label="Carregando fatores MFA">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <>
              {/* Status summary */}
              <div className="flex items-center justify-between gap-3 flex-wrap p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {isEnrolled ? (
                    <ShieldCheck className="h-10 w-10 text-success" aria-hidden="true" />
                  ) : (
                    <ShieldAlert className="h-10 w-10 text-warning" aria-hidden="true" />
                  )}
                  <div>
                    <p className="font-medium">Status do MFA</p>
                    <p className="text-sm text-muted-foreground">
                      {isEnrolled
                        ? 'Sua conta está protegida com MFA'
                        : 'Nenhum fator verificado — sua conta está vulnerável'}
                    </p>
                  </div>
                </div>
                <Badge variant={isEnrolled ? 'default' : 'destructive'}>
                  {isEnrolled ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>

              {!isEnrolled && (
                <Alert role="status">
                  <AlertDescription>
                    Recomendamos ativar pelo menos um fator para proteger sua conta contra
                    acessos não autorizados.
                  </AlertDescription>
                </Alert>
              )}

              {/* Factors list */}
              {rows.length > 0 && (
                <section aria-label="Fatores configurados" className="space-y-2">
                  <h4 className="font-medium text-sm">Fatores configurados</h4>
                  <ul className="space-y-2">
                    {rows.map((factor) => {
                      const verified = factor.status === 'verified';
                      return (
                        <li
                          key={factor.id}
                          className="flex items-center justify-between gap-3 p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <FactorIcon type={factor.factor_type} />
                            <div className="min-w-0">
                              <p className="font-medium truncate">
                                {factor.friendly_name || 'Sem nome'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {factorLabel(factor.factor_type)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant={verified ? 'default' : 'secondary'}>
                              {verified ? 'Verificado' : 'Pendente'}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setFactorToRemove(factor)}
                              aria-label={`Remover fator ${factor.friendly_name || factor.factor_type}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              {/* Add factor */}
              <Button
                onClick={() => setView('enroll')}
                className="w-full"
                aria-label="Adicionar novo fator MFA"
              >
                <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                Adicionar novo fator
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!factorToRemove}
        onOpenChange={(open) => !open && !removing && setFactorToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover fator MFA?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a remover{' '}
              <strong>{factorToRemove?.friendly_name || factorLabel(factorToRemove?.factor_type ?? '')}</strong>
              . Sua conta ficará mais vulnerável até que outro fator seja configurado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void confirmRemove();
              }}
              disabled={removing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removing ? 'Removendo…' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export const UnifiedMFAPanel = memo(UnifiedMFAPanelBase);
