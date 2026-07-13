import { useCallback, useMemo, useState } from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import {
  AlertTriangle,
  Loader2,
  Shield,
  ShieldCheck,
  ShieldOff,
  Smartphone,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { MFAEnroll } from '@/components/MFAEnroll';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useMFA } from '@/hooks/useMFA';

const DEFAULT_FACTOR_LABEL = 'Aplicativo autenticador';

function formatEnrollmentDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function MFASettings() {
  const { isEnrolled, factors, loading, unenroll, checkMFAStatus } = useMFA();
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [disablingId, setDisablingId] = useState<string | null>(null);
  const [bulkCleaning, setBulkCleaning] = useState(false);

  const { verifiedFactors, unverifiedFactors } = useMemo(() => {
    const list = Array.isArray(factors) ? factors : [];
    return {
      verifiedFactors: list.filter((f) => f.status === 'verified'),
      unverifiedFactors: list.filter((f) => f.status !== 'verified'),
    };
  }, [factors]);

  const handleEnrolled = useCallback(() => {
    setShowEnrollDialog(false);
    void checkMFAStatus();
  }, [checkMFAStatus]);

  const handleUnenroll = useCallback(
    async (factorId: string, label: string) => {
      setDisablingId(factorId);
      const { error } = await unenroll(factorId);
      setDisablingId(null);
      if (error) {
        toast.error(`Erro ao remover ${label}: ${error.message}`);
        return false;
      }
      toast.success(`${label} removido com sucesso`);
      return true;
    },
    [unenroll],
  );

  const handleClearUnverified = useCallback(async () => {
    if (unverifiedFactors.length === 0) return;
    setBulkCleaning(true);
    try {
      // Serial para não estourar rate limit da API de auth
      for (const factor of unverifiedFactors) {
        await handleUnenroll(factor.id, factor.friendly_name || 'Fator pendente');
      }
    } finally {
      setBulkCleaning(false);
    }
  }, [unverifiedFactors, handleUnenroll]);

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardContent
          className="flex items-center justify-center py-8"
          role="status"
          aria-live="polite"
          aria-label="Carregando configurações de 2FA"
        >
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">Carregando…</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${isEnrolled ? 'bg-success/20' : 'bg-muted'}`}
              aria-hidden="true"
            >
              {isEnrolled ? (
                <ShieldCheck className="h-5 w-5 text-success" />
              ) : (
                <ShieldOff className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">Autenticação de dois fatores (2FA)</CardTitle>
              <CardDescription>
                Adicione uma camada extra de segurança à sua conta
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={isEnrolled ? 'default' : 'secondary'}
            className={isEnrolled ? 'bg-success text-success-foreground' : ''}
          >
            {isEnrolled ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isEnrolled ? (
          <>
            <Alert className="bg-success/10 border-success/20">
              <ShieldCheck className="h-4 w-4 text-success" aria-hidden="true" />
              <AlertDescription className="text-success">
                Sua conta está protegida com autenticação de dois fatores.
              </AlertDescription>
            </Alert>

            <ul className="space-y-2" aria-label="Fatores de autenticação ativos">
              {verifiedFactors.map((factor) => {
                const label = factor.friendly_name || DEFAULT_FACTOR_LABEL;
                const isDisabling = disablingId === factor.id;
                return (
                  <li
                    key={factor.id}
                    className="flex items-center justify-between gap-3 p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Smartphone
                        className="h-5 w-5 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{label}</p>
                        <p className="text-sm text-muted-foreground">
                          Configurado em {formatEnrollmentDate(factor.created_at)}
                        </p>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive shrink-0"
                          aria-label={`Remover ${label}`}
                          disabled={isDisabling}
                        >
                          {isDisabling ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          ) : (
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Desativar 2FA?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Isso removerá a proteção de autenticação de dois fatores da sua conta.
                            Você precisará configurar novamente se quiser reativá-la.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleUnenroll(factor.id, label)}
                            disabled={isDisabling}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isDisabling ? (
                              <Loader2
                                className="h-4 w-4 animate-spin mr-2"
                                aria-hidden="true"
                              />
                            ) : null}
                            Desativar 2FA
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </li>
                );
              })}
            </ul>

            {unverifiedFactors.length > 0 && (
              <Alert
                variant="destructive"
                className="bg-warning/10 border-warning/30"
                role="alert"
              >
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
                  <span>
                    {unverifiedFactors.length === 1
                      ? 'Existe 1 configuração de 2FA incompleta.'
                      : `Existem ${unverifiedFactors.length} configurações de 2FA incompletas.`}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClearUnverified}
                    disabled={bulkCleaning || disablingId !== null}
                  >
                    {bulkCleaning ? (
                      <>
                        <Loader2
                          className="h-4 w-4 animate-spin mr-2"
                          aria-hidden="true"
                        />
                        Limpando…
                      </>
                    ) : (
                      'Limpar pendentes'
                    )}
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          <>
            <Alert>
              <Shield className="h-4 w-4" aria-hidden="true" />
              <AlertDescription>
                A autenticação de dois fatores adiciona uma camada extra de segurança, exigindo
                um código do seu celular além da senha para fazer login.
              </AlertDescription>
            </Alert>

            <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <ShieldCheck className="h-4 w-4 mr-2" aria-hidden="true" />
                  Ativar 2FA
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <VisuallyHidden>
                  <DialogTitle>Ativar autenticação de dois fatores</DialogTitle>
                </VisuallyHidden>
                <MFAEnroll
                  onEnrolled={handleEnrolled}
                  onCancel={() => setShowEnrollDialog(false)}
                />
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  );
}
