import { useState } from 'react';
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

export function MFAPhoneEnroll({ onEnrolled, onCancel }: MFAPhoneEnrollProps) {
  const {
    isEnrolling,
    isVerifying,
    phoneNumber,
    factorId,
    error,
    enrollPhone,
    verifyPhone,
    resendCode,
    reset,
  } = useMFAPhone();

  const [inputPhone, setInputPhone] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');

  const formatPhoneInput = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPhone(formatPhoneInput(e.target.value));
  };

  const handleEnrollPhone = async () => {
    const result = await enrollPhone(inputPhone);
    if (result.data) {
      setStep('verify');
    }
  };

  const handleVerify = async () => {
    const result = await verifyPhone(verifyCode);
    if (result.data) {
      onEnrolled();
    }
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
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Phone className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Configurar MFA por SMS</CardTitle>
          <CardDescription>
            Receba códigos de verificação por mensagem de texto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone">Número de Celular</Label>
            <div className="flex gap-2">
              <div className="flex items-center px-3 bg-muted rounded-l-md border border-r-0">
                <span className="text-sm text-muted-foreground">+55</span>
              </div>
              <Input
                id="phone"
                type="tel"
                value={inputPhone}
                onChange={handlePhoneChange}
                placeholder="(11) 99999-9999"
                className="rounded-l-none"
                maxLength={16}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Será enviado um código de verificação para este número
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={handleEnrollPhone}
              disabled={inputPhone.replace(/\D/g, '').length < 11 || isEnrolling}
              className="flex-1"
            >
              {isEnrolling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Enviar Código
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <MessageSquare className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>Verificar Código SMS</CardTitle>
        <CardDescription>
          Digite o código enviado para {phoneNumber}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="sms-code">Código de Verificação</Label>
          <Input
            id="sms-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="text-center text-2xl tracking-widest font-mono"
          />
        </div>

        <Button
          variant="link"
          onClick={resendCode}
          className="w-full"
          disabled={isVerifying}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reenviar código
        </Button>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={handleBack} className="flex-1">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button
            onClick={handleVerify}
            disabled={verifyCode.length !== 6 || isVerifying}
            className="flex-1"
          >
            {isVerifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Ativar SMS MFA
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
