import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MFAVerifyProps {
  onVerified: () => void;
  onBack?: () => void;
}

const CODE_LENGTH = 6;

function humanizeVerifyError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes('invalid') || normalized.includes('incorrect')) {
    return 'Código inválido. Tente novamente.';
  }
  if (normalized.includes('expired')) {
    return 'Código expirado. Aguarde um novo código no aplicativo.';
  }
  if (normalized.includes('rate') || normalized.includes('too many')) {
    return 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.';
  }
  if (normalized.includes('network') || normalized.includes('fetch')) {
    return 'Falha de conexão. Verifique sua internet e tente novamente.';
  }
  return 'Não foi possível verificar o código. Tente novamente.';
}

export function MFAVerify({ onVerified, onBack }: MFAVerifyProps) {
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [factorsLoading, setFactorsLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
      if (cancelled) return;
      if (listError) {
        setError('Não foi possível carregar os fatores 2FA.');
      } else {
        const totpFactor = factors?.totp?.[0];
        if (totpFactor) {
          setFactorId(totpFactor.id);
        } else {
          setError('Nenhum fator 2FA encontrado nesta conta.');
        }
      }
      setFactorsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!factorsLoading && factorId) {
      inputRef.current?.focus();
    }
  }, [factorsLoading, factorId]);

  const handleVerify = async (event?: FormEvent) => {
    event?.preventDefault();

    if (!factorId) {
      setError('Nenhum fator 2FA encontrado.');
      return;
    }
    if (verifyCode.length !== CODE_LENGTH) {
      setError(`O código deve ter ${CODE_LENGTH} dígitos.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });
      if (challengeError) {
        setError(humanizeVerifyError(challengeError.message));
        return;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verifyCode,
      });

      if (verifyError) {
        setError(humanizeVerifyError(verifyError.message));
        setVerifyCode('');
        inputRef.current?.focus();
        return;
      }

      onVerified();
    } catch {
      setError('Erro ao verificar código. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !loading && !factorsLoading && !!factorId && verifyCode.length === CODE_LENGTH;

  return (
    <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="text-center">
        <div
          className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4"
          aria-hidden="true"
        >
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>Verificação em Duas Etapas</CardTitle>
        <CardDescription>
          Digite o código de {CODE_LENGTH} dígitos do seu aplicativo autenticador
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify} className="space-y-4" noValidate>
          {error && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="mfa-code">Código de verificação</Label>
            <Input
              ref={inputRef}
              id="mfa-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={CODE_LENGTH}
              placeholder="000000"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH))}
              disabled={loading || factorsLoading}
              aria-invalid={!!error}
              aria-describedby={error ? 'mfa-code-error' : 'mfa-code-hint'}
              className="text-center text-2xl tracking-widest font-mono tabular-nums"
            />
            <p id="mfa-code-hint" className="text-xs text-muted-foreground text-center">
              Abra seu app autenticador (Google Authenticator, Microsoft Authenticator, etc.) e digite o código exibido
            </p>
            {error && (
              <p id="mfa-code-error" className="sr-only">
                {error}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button type="submit" disabled={!canSubmit} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" /> : null}
              Verificar
            </Button>

            {onBack && (
              <Button type="button" variant="ghost" onClick={onBack} className="w-full" disabled={loading}>
                <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                Voltar ao login
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
