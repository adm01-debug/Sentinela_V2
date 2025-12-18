import { useState, useEffect } from 'react';
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

export function MFAVerify({ onVerified, onBack }: MFAVerifyProps) {
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);

  useEffect(() => {
    // Get the TOTP factor ID
    const getFactorId = async () => {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.totp?.[0];
      if (totpFactor) {
        setFactorId(totpFactor.id);
      }
    };
    getFactorId();
  }, []);

  const handleVerify = async () => {
    if (!factorId) {
      setError('Nenhum fator 2FA encontrado');
      return;
    }

    if (verifyCode.length !== 6) {
      setError('O código deve ter 6 dígitos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ 
        factorId 
      });

      if (challengeError) {
        setError(challengeError.message);
        setLoading(false);
        return;
      }

      // Verify
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verifyCode,
      });

      if (verifyError) {
        setError('Código inválido. Tente novamente.');
        setLoading(false);
        return;
      }

      onVerified();
    } catch (err) {
      setError('Erro ao verificar código');
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && verifyCode.length === 6) {
      handleVerify();
    }
  };

  return (
    <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>Verificação em Duas Etapas</CardTitle>
        <CardDescription>
          Digite o código de 6 dígitos do seu aplicativo autenticador
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="mfa-code">Código de verificação</Label>
          <Input
            id="mfa-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="000000"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
            onKeyDown={handleKeyDown}
            className="text-center text-2xl tracking-widest font-mono"
            autoFocus
          />
          <p className="text-xs text-muted-foreground text-center">
            Abra seu app autenticador (Google Authenticator, Microsoft Authenticator, etc.) e digite o código exibido
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button 
            onClick={handleVerify} 
            disabled={loading || verifyCode.length !== 6} 
            className="w-full"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Verificar
          </Button>
          
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao login
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
