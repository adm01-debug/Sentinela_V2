import { useState } from 'react';
import { Loader2, Lock, Smartphone, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMFA } from '@/hooks/useMFA';
import { SensitiveAction } from '@/hooks/useReauthentication';

interface ReauthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: SensitiveAction | null;
  onVerifyPassword: (password: string) => Promise<boolean>;
  onVerifyMFA: (code: string) => Promise<boolean>;
  isVerifying: boolean;
  error: string | null;
}

const ACTION_LABELS: Record<SensitiveAction, string> = {
  change_password: 'Alterar Senha',
  change_email: 'Alterar Email',
  configure_mfa: 'Configurar MFA',
  disable_mfa: 'Desativar MFA',
  admin_action: 'Ação Administrativa',
  delete_account: 'Excluir Conta',
  update_security_settings: 'Atualizar Configurações de Segurança',
};

export function ReauthDialog({
  open,
  onOpenChange,
  action,
  onVerifyPassword,
  onVerifyMFA,
  isVerifying,
  error,
}: ReauthDialogProps) {
  const { isEnrolled } = useMFA();
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [activeTab, setActiveTab] = useState<'password' | 'mfa'>('password');

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onVerifyPassword(password);
    if (success) {
      setPassword('');
      onOpenChange(false);
    }
  };

  const handleMFASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onVerifyMFA(mfaCode);
    if (success) {
      setMfaCode('');
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setMfaCode('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Verificação de Segurança
          </DialogTitle>
          <DialogDescription>
            {action && (
              <>
                Para <strong>{ACTION_LABELS[action]}</strong>, confirme sua identidade.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'password' | 'mfa')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Senha
            </TabsTrigger>
            <TabsTrigger value="mfa" disabled={!isEnrolled} className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              MFA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="password">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reauth-password">Sua senha atual</Label>
                <Input
                  id="reauth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  autoFocus
                  disabled={isVerifying}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                  disabled={isVerifying}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!password || isVerifying}
                >
                  {isVerifying ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Verificar
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="mfa">
            <form onSubmit={handleMFASubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reauth-mfa">Código do Autenticador</Label>
                <Input
                  id="reauth-mfa"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="text-center text-xl tracking-widest font-mono"
                  autoFocus
                  disabled={isVerifying}
                />
                <p className="text-xs text-muted-foreground">
                  Digite o código de 6 dígitos do seu app autenticador
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                  disabled={isVerifying}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={mfaCode.length !== 6 || isVerifying}
                >
                  {isVerifying ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Verificar
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
