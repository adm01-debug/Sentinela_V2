import { memo, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Shield, Copy, Check, QrCode, Smartphone, Phone } from 'lucide-react';
import { useMFA } from '@/hooks/useMFA';
import { MFAPhoneEnroll } from '@/components/security/MFAPhoneEnroll';
import { toast } from 'sonner';

interface MFAEnrollProps {
  onEnrolled: () => void;
  onCancel: () => void;
}

interface StepItem {
  title: string;
  description: string;
}

const TOTP_STEPS: readonly StepItem[] = [
  { title: 'Instale um app autenticador', description: 'Google Authenticator, Microsoft Authenticator, ou similar' },
  { title: 'Escaneie o QR code', description: 'Use o app para escanear o código que será exibido' },
  { title: 'Digite o código de verificação', description: 'Confirme a configuração com o código gerado' },
] as const;

const SMS_STEPS: readonly StepItem[] = [
  { title: 'Informe seu número de celular', description: 'Usaremos este número para enviar códigos de verificação' },
  { title: 'Receba o código por SMS', description: 'Um código será enviado para seu celular' },
  { title: 'Confirme o código', description: 'Digite o código recebido para ativar' },
] as const;

const StepList = ({ steps }: { steps: readonly StepItem[] }) => (
  <ol className="bg-muted/50 rounded-lg p-4 space-y-3" aria-label="Etapas de configuração">
    {steps.map((s, i) => (
      <li key={s.title} className="flex items-start gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-medium"
          aria-hidden="true"
        >
          {i + 1}
        </div>
        <div className="min-w-0">
          <p className="font-medium">{s.title}</p>
          <p className="text-sm text-muted-foreground">{s.description}</p>
        </div>
      </li>
    ))}
  </ol>
);

function MFAEnrollBase({ onEnrolled, onCancel }: MFAEnrollProps) {
  const { enroll, verify } = useMFA();
  const [method, setMethod] = useState<'totp' | 'sms'>('totp');
  const [step, setStep] = useState<'choose' | 'qrcode' | 'verify'>('choose');
  const [qrCodeUri, setQrCodeUri] = useState('');
  const [secret, setSecret] = useState('');
  const [factorId, setFactorId] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleStartEnroll = async () => {
    setLoading(true);
    setError('');

    const response = await enroll('SecureWatch 2FA');

    if (response.error) {
      setError(response.error.message);
      setLoading(false);
      return;
    }

    if (response.data && response.data.type === 'totp') {
      setFactorId(response.data.id);
      setQrCodeUri(response.data.totp.qr_code);
      setSecret(response.data.totp.secret);
      setStep('qrcode');
    }

    setLoading(false);
  };

  const handleVerify = async (e?: FormEvent) => {
    e?.preventDefault();
    if (verifyCode.length !== 6) {
      setError('O código deve ter 6 dígitos');
      return;
    }

    setLoading(true);
    setError('');

    const { error: verifyError } = await verify(factorId, verifyCode);

    if (verifyError) {
      setError('Código inválido. Tente novamente.');
      setLoading(false);
      return;
    }

    toast.success('2FA ativado com sucesso!');
    onEnrolled();
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      toast.success('Código copiado');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Não foi possível copiar. Copie manualmente.');
    }
  };

  // Step 1: Choose method
  if (step === 'choose') {
    return (
      <Card className="border-border/50">
        <CardHeader className="text-center">
          <div
            className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4"
            aria-hidden="true"
          >
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Escolha o Método de 2FA</CardTitle>
          <CardDescription>
            Selecione como deseja receber os códigos de verificação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={method} onValueChange={(v) => setMethod(v as 'totp' | 'sms')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="totp" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" aria-hidden="true" />
                App Autenticador
              </TabsTrigger>
              <TabsTrigger value="sms" className="flex items-center gap-2">
                <Phone className="h-4 w-4" aria-hidden="true" />
                SMS
              </TabsTrigger>
            </TabsList>

            <TabsContent value="totp" className="mt-4 space-y-3">
              <StepList steps={TOTP_STEPS} />
            </TabsContent>

            <TabsContent value="sms" className="mt-4 space-y-3">
              <StepList steps={SMS_STEPS} />
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onCancel} className="flex-1" type="button">
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (method === 'sms') {
                  setStep('verify'); // delegated to MFAPhoneEnroll below
                } else {
                  handleStartEnroll();
                }
              }}
              disabled={loading}
              className="flex-1"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" /> : null}
              Continuar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // SMS Flow - Delegate to MFAPhoneEnroll
  if (method === 'sms') {
    return <MFAPhoneEnroll onEnrolled={onEnrolled} onCancel={onCancel} />;
  }

  // TOTP Flow - Step 2: QR Code
  if (step === 'qrcode') {
    return (
      <Card className="border-border/50">
        <CardHeader className="text-center">
          <div
            className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4"
            aria-hidden="true"
          >
            <QrCode className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Escaneie o QR Code</CardTitle>
          <CardDescription>
            Use seu aplicativo autenticador para escanear o código abaixo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg">
              <img
                src={qrCodeUri}
                alt="QR Code para configuração da autenticação de dois fatores"
                className="w-48 h-48"
                width={192}
                height={192}
              />
            </div>
          </div>

          {/* Manual entry */}
          <div className="space-y-2">
            <Label htmlFor="totp-secret" className="text-sm text-center block text-muted-foreground">
              Ou digite o código manualmente:
            </Label>
            <div className="flex items-center gap-2">
              <code
                id="totp-secret"
                className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono break-all select-all"
              >
                {secret}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={copySecret}
                type="button"
                aria-label={copied ? 'Código copiado' : 'Copiar código secreto'}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel} className="flex-1" type="button">
              Cancelar
            </Button>
            <Button onClick={() => setStep('verify')} className="flex-1" type="button">
              Próximo
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // TOTP Flow - Step 3: Verify
  return (
    <Card className="border-border/50">
      <CardHeader className="text-center">
        <div
          className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4"
          aria-hidden="true"
        >
          <Smartphone className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>Verificar Configuração</CardTitle>
        <CardDescription>
          Digite o código de 6 dígitos do seu aplicativo autenticador
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify} className="space-y-4">
          {error && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="verify-code">Código de verificação</Label>
            <Input
              id="verify-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
              className="text-center text-2xl tracking-widest font-mono tabular-nums"
              autoComplete="one-time-code"
              autoFocus
              aria-invalid={!!error}
              aria-describedby={error ? 'verify-code-error' : undefined}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setStep('qrcode')}
              className="flex-1"
              type="button"
            >
              Voltar
            </Button>
            <Button
              type="submit"
              disabled={loading || verifyCode.length !== 6}
              className="flex-1"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" /> : null}
              Ativar 2FA
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Memo wrappers
export const MFAEnroll = memo(MFAEnrollBase);
