import { memo, useEffect, useRef, useState, type FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Phone, MessageSquare, ArrowLeft, RefreshCw } from 'lucide-react';
import { useMFAPhone } from '@/hooks/useMFAPhone';

interface MFAPhoneEnrollProps {
  onEnrolled: () => void;
  onCancel: () => void;
}

const RESEND_COOLDOWN_SECONDS = 30;

const PHONE_MAX_LEN = 16;
const CODE_LEN = 6;

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function MFAPhoneEnroll({ onEnrolled, onCancel }: MFAPhoneEnrollProps) {
  const {
    isEnrolling,
    isVerifying,
    phoneNumber,
    error,
    enrollPhone,
    verifyPhone,
    resendCode,
    reset,
  } = useMFAPhone();

  const [inputPhone, setInputPhone] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');

  const phoneDigits = inputPhone.replace(/\D/g, '');
  const canSubmitPhone = phoneDigits.length === 11 && !isEnrolling;
  const canSubmitCode = verifyCode.length === CODE_LEN && !isVerifying;

  const handleEnrollPhone = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!canSubmitPhone) return;
    const result = await enrollPhone(inputPhone);
    if (result.data) setStep('verify');
  };

  const handleVerify = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!canSubmitCode) return;
    const result = await verifyPhone(verifyCode);
    if (result.data) onEnrolled();
  };

  const handleBack = () => {
    reset();
    setStep('phone');
    setInputPhone('');
    setVerifyCode('');
  };

  if (step === 'phone') {
    return (
      <Card className="border-border/50">
        <CardHeader className="text-center">
          <div
            className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4"
            aria-hidden="true"
          >
            <Phone className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Configurar MFA por SMS</CardTitle>
          <CardDescription>Receba códigos de verificação por mensagem de texto</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEnrollPhone} className="space-y-4" noValidate>
            {error && (
              <Alert variant="destructive" role="alert">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">Número de celular</Label>
              <div className="flex gap-0">
                <div
                  className="flex items-center px-3 bg-muted rounded-l-md border border-r-0"
                  aria-hidden="true"
                >
                  <span className="text-sm text-muted-foreground">+55</span>
                </div>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel-national"
                  value={inputPhone}
                  onChange={(e) => setInputPhone(formatPhoneInput(e.target.value))}
                  placeholder="(11) 99999-9999"
                  className="rounded-l-none"
                  maxLength={PHONE_MAX_LEN}
                  aria-describedby="phone-help"
                  aria-invalid={inputPhone.length > 0 && !canSubmitPhone}
                  required
                />
              </div>
              <p id="phone-help" className="text-xs text-muted-foreground">
                Será enviado um código de verificação para este número
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={!canSubmitPhone} className="flex-1">
                {isEnrolling && <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />}
                Enviar código
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="text-center">
        <div
          className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4"
          aria-hidden="true"
        >
          <MessageSquare className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>Verificar código SMS</CardTitle>
        <CardDescription>
          Digite o código enviado para <span className="font-medium">{phoneNumber}</span>
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
            <Label htmlFor="sms-code">Código de verificação</Label>
            <Input
              id="sms-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={CODE_LEN}
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, CODE_LEN))}
              placeholder="000000"
              className="text-center text-2xl tracking-widest font-mono"
              aria-label="Código de 6 dígitos"
              required
            />
          </div>

          <Button
            type="button"
            variant="link"
            onClick={resendCode}
            className="w-full"
            disabled={isVerifying || isEnrolling}
          >
            <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
            Reenviar código
          </Button>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
              Voltar
            </Button>
            <Button type="submit" disabled={!canSubmitCode} className="flex-1">
              {isVerifying && <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />}
              Ativar SMS MFA
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
