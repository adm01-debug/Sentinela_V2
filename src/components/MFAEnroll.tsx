import { memo, useState } from 'react';
import { Loader2, Shield, Copy, Check, QrCode, Smartphone, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMFA } from '@/hooks/useMFA';
import { MFAPhoneEnroll } from '@/components/security/MFAPhoneEnroll';

interface MFAEnrollProps {
  onEnrolled: () => void;
  onCancel: () => void;
}

function MFAEnrollBase({ onEnrolled, onCancel }: MFAEnrollProps) {
  const { enroll, verify } = useMFA();
  const [method, setMethod] = useState<'totp' | 'sms' | null>(null);
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

  const handleVerify = async () => {
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

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Step 1: Choose method
  if (step === 'choose') {
    return (
      <Card className="border-border/50">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Escolha o Método de 2FA</CardTitle>
          <CardDescription>
            Selecione como deseja receber os códigos de verificação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="totp" onValueChange={(v) => setMethod(v as 'totp' | 'sms')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="totp" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                App Autenticador
              </TabsTrigger>
              <TabsTrigger value="sms" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                SMS
              </TabsTrigger>
            </TabsList>

            <TabsContent value="totp" className="mt-4 space-y-3">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Instale um app autenticador</p>
                    <p className="text-sm text-muted-foreground">
                      Google Authenticator, Microsoft Authenticator, ou similar
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Escaneie o QR code</p>
                    <p className="text-sm text-muted-foreground">
                      Use o app para escanear o código que será exibido
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Digite o código de verificação</p>
                    <p className="text-sm text-muted-foreground">
                      Confirme a configuração com o código gerado
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sms" className="mt-4 space-y-3">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Informe seu número de celular</p>
                    <p className="text-sm text-muted-foreground">
                      Usaremos este número para enviar códigos de verificação
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Receba o código por SMS</p>
                    <p className="text-sm text-muted-foreground">
                      Um código será enviado para seu celular
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Confirme o código</p>
                    <p className="text-sm text-muted-foreground">
                      Digite o código recebido para ativar
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                if (method === 'sms') {
                  setMethod('sms');
                } else {
                  handleStartEnroll();
                }
              }} 
              disabled={loading} 
              className="flex-1"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
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
              <img src={qrCodeUri} alt="QR Code para 2FA" className="w-48 h-48" />
            </div>
          </div>

          {/* Manual entry */}
          <div className="space-y-2">
            <p className="text-sm text-center text-muted-foreground">
              Ou digite o código manualmente:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono break-all">
                {secret}
              </code>
              <Button variant="outline" size="icon" onClick={copySecret}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={() => setStep('verify')} className="flex-1">
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
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Smartphone className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>Verificar Configuração</CardTitle>
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
            className="text-center text-2xl tracking-widest font-mono"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => setStep('qrcode')} className="flex-1">
            Voltar
          </Button>
          <Button onClick={handleVerify} disabled={loading || verifyCode.length !== 6} className="flex-1">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Ativar 2FA
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Memo wrappers
export const MFAEnroll = memo(MFAEnrollBase);
