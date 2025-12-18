import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Shield, ShieldCheck, ShieldOff, Loader2, Smartphone, Trash2 } from 'lucide-react';
import { useMFA } from '@/hooks/useMFA';
import { MFAEnroll } from '@/components/MFAEnroll';
import { toast } from 'sonner';

export function MFASettings() {
  const { isEnrolled, factors, loading, unenroll, checkMFAStatus } = useMFA();
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [disabling, setDisabling] = useState(false);

  const handleEnrolled = () => {
    setShowEnrollDialog(false);
    checkMFAStatus();
  };

  const handleDisable2FA = async () => {
    const verifiedFactor = factors.find(f => f.status === 'verified');
    if (!verifiedFactor) return;

    setDisabling(true);
    const { error } = await unenroll(verifiedFactor.id);
    setDisabling(false);

    if (error) {
      toast.error('Erro ao desativar 2FA: ' + error.message);
    } else {
      toast.success('2FA desativado com sucesso');
    }
  };

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isEnrolled ? 'bg-success/20' : 'bg-muted'}`}>
              {isEnrolled ? (
                <ShieldCheck className="h-5 w-5 text-success" />
              ) : (
                <ShieldOff className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">Autenticação de Dois Fatores (2FA)</CardTitle>
              <CardDescription>
                Adicione uma camada extra de segurança à sua conta
              </CardDescription>
            </div>
          </div>
          <Badge variant={isEnrolled ? 'default' : 'secondary'} className={isEnrolled ? 'bg-success' : ''}>
            {isEnrolled ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEnrolled ? (
          <>
            <Alert className="bg-success/10 border-success/20">
              <ShieldCheck className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">
                Sua conta está protegida com autenticação de dois fatores.
              </AlertDescription>
            </Alert>

            {factors.filter(f => f.status === 'verified').map((factor) => (
              <div key={factor.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{factor.friendly_name || 'Authenticator App'}</p>
                    <p className="text-sm text-muted-foreground">
                      Configurado em {new Date(factor.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
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
                        onClick={handleDisable2FA}
                        disabled={disabling}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {disabling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Desativar 2FA
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </>
        ) : (
          <>
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                A autenticação de dois fatores adiciona uma camada extra de segurança, 
                exigindo um código do seu celular além da senha para fazer login.
              </AlertDescription>
            </Alert>

            <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Ativar 2FA
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
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
